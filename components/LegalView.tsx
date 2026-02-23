import React from 'react';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';

interface LegalViewProps {
  documentType: 'PRIVACY' | 'TERMS';
  onBack: () => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ documentType, onBack }) => {
  const isPrivacy = documentType === 'PRIVACY';

  return (

    <div className="h-screen w-full bg-[#050505] text-slate-300 overflow-y-auto font-sans selection:bg-emerald-500/30">
      
      {/* Barra de Navegación Superior */}
      <div className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Regresar
        </button>
        <img src="/LOGO2.png" alt="JUXA" className="h-6 w-auto opacity-80" />
      </div>

      {/* Contenedor del Documento */}
      <div className="max-w-4xl mx-auto py-12 px-6 lg:px-8">
        
        {/* Encabezado del Documento */}
        <div className="mb-12 border-b border-white/10 pb-8 text-center md:text-left">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-6">
            {isPrivacy ? <ShieldCheck className="text-emerald-500 w-8 h-8" /> : <FileText className="text-blue-500 w-8 h-8" />}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            {isPrivacy ? 'Aviso de Privacidad Integral' : 'Términos y Condiciones del Servicio'}
          </h1>
          <p className="text-slate-500 text-sm md:text-base tracking-widest uppercase font-bold">
            JX LABS S.A. DE C.V. / JUXA
          </p>
        </div>

        {/* Contenido Dinámico */}
        <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-a:text-blue-400 prose-strong:text-emerald-400">
          
          {isPrivacy ? (
            // --- CONTENIDO: AVISO DE PRIVACIDAD ---
            <div className="space-y-8 text-sm md:text-base leading-relaxed text-justify">
              <p>
                En cumplimiento de lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, su Reglamento y demás disposiciones aplicables, se emite el presente Aviso de Privacidad Integral, aplicable a la plataforma tecnológica denominada <strong>"JX LABS, S.A. DE C.V."</strong>, también conocida comercialmente como <strong> "JUXA"</strong>, con domicilio en <strong>Calle José Enrique Pestalozzi número 344, Colonia Narvarte Poniente, Alcaldía Benito Juárez, Ciudad de México, Código Postal 03020</strong>, quien es responsable del tratamiento de los datos personales que se recaben a través de la plataforma.
              </p>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4 mb-4">I. IDENTIDAD DEL RESPONSABLE</h2>
                <p>JX LABS, S.A. DE C.V. / JUXA es responsable del tratamiento de los datos personales recabados a través de su plataforma digital, sitio web, aplicaciones, sistemas Software as a Service (SaaS), herramientas de inteligencia artificial, formularios electrónicos y cualquier otro medio digital o físico relacionado con sus servicios.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4 mb-4">II. ALCANCE Y LIMITACIONES DE LA PLATAFORMA</h2>
                <p>La plataforma opera como un sistema tecnológico de apoyo, bajo el modelo SaaS, proporcionando herramientas digitales, infraestructura tecnológica, automatización de flujos, sistemas de comunicación y módulos de gestión operativa. En ningún caso la plataforma:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Sustituye a los usuarios o clientes en sus obligaciones legales o regulatorias.</li>
                  <li>Asume responsabilidad frente a terceros derivados de consultas o decisiones jurídicas.</li>
                  <li>Emite determinaciones con efectos jurídicos obligatorios.</li>
                  <li>Realiza actos de autoridad, coerción o presión indebida.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4 mb-4">III. ROL EN EL TRATAMIENTO DE LOS DATOS PERSONALES</h2>
                <p>Dependiendo del servicio contratado:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong>JX LABS / JUXA podrá actuar como responsable del tratamiento</strong>, cuando recabe datos personales directamente de usuarios finales.</li>
                  <li><strong>JX LABS / JUXA podrá actuar como encargado del tratamiento</strong>, cuando los datos personales sean proporcionados por clientes, despachos, empresas o instituciones que mantengan la relación jurídica directa con el titular.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4 mb-4">IV. DATOS PERSONALES QUE SE TRATAN</h2>
                <p>Los datos personales que pueden ser tratados incluyen: Nombre completo, Teléfono, Correo electrónico, Domicilio, CURP, RFC, Datos profesionales o laborales, Información jurídica relacionada con consultas o servicios solicitados, Datos de uso de la plataforma, y Mensajes, interacciones y registros técnicos.</p>
                <p className="mt-2 text-slate-400 italic">JX LABS / JUXA no recaba datos personales sensibles, salvo que el titular los proporcione voluntariamente dentro de una consulta legal específica, bajo su responsabilidad.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4 mb-4">V. FINALIDADES DEL TRATAMIENTO</h2>
                <h3 className="text-lg font-bold text-emerald-400 mt-8 mb-3">A) Finalidades primarias</h3>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Prestación de servicios de consultoría legal.</li>
                  <li>Operación y administración de la plataforma tecnológica.</li>
                  <li>Desarrollo y mejora de herramientas legaltech, software y SaaS.</li>
                  <li>Atención de solicitudes, consultas y asesorías personalizadas.</li>
                  <li>Gestión de cuentas, accesos y soporte técnico.</li>
                  <li>Cumplimiento de obligaciones legales y contractuales.</li>
                </ul>

                <h3 className="text-lg font-bold text-emerald-400 mt-8 mb-3">B) Finalidades secundarias</h3>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Elaboración de estadísticas.</li>
                  <li>Análisis de rendimiento y mejora continua.</li>
                  <li>Envío de información comercial y promocional.</li>
                  <li> Compartir información con empresas filiales, subsidiarias o del mismo grupo corporativo, para fines tecnológicos, comerciales o informativos.</li>
                </ul>
                <p>El titular podrá manifestar su negativa respecto de las finalidades secundarias conforme al apartado de derechos ARCO.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4 mb-4">VI. USO DE INTELIGENCIA ARTIFICIAL Y AUTOMATIZACIÓN</h2>
                <p>La plataforma puede incorporar sistemas automatizados, bots e inteligencia artificial:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Operan bajo parámetros definidos por JX LABS / JUXA o el cliente.</li>
                  <li>Cuentan con supervisión humana.</li>
                  <li>No emiten decisiones automatizadas con efectos jurídicos obligatorios.</li>
                </ul>
                <p className="mt-6 font-bold text-white border-l-2 border-slate-500 pl-4">La inteligencia artificial es utilizada como herramienta de apoyo, no como sustituto de asesoría legal personalizada.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4 mb-4">VII. TRANSFERENCIAS DE DATOS PERSONALES</h2>
                <p>
                  Los datos personales tratados por JX LABS, S.A. DE C.V., también conocida como "JUXA", podrán ser transferidos, comunicados, compartidos o puestos a disposición, dentro y fuera de los Estados Unidos Mexicanos, sin requerir consentimiento adicional del titular, en los supuestos permitidos por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, su Reglamento y demás disposiciones aplicables, en los términos siguientes:
                </p>

                {/* Inciso A */}
                <h3 className="text-lg font-bold text-emerald-400 mt-8 mb-3">A) Transferencias a empresas del mismo grupo corporativo</h3>
                <p>Los datos personales podrán ser transferidos a:</p>
                <ul className="list-disc pl-6 space-y-4 mt-2">
                  <li>
                    Empresas filiales, subsidiarias, controladoras, afiliadas o pertenecientes al mismo grupo corporativo de JX LABS / JUXA, actuales o futuras, nacionales o extranjeras, siempre que dichas entidades:
                    <ul className="list-[circle] pl-6 mt-3 space-y-2 text-slate-400">
                      <li>Operen bajo los mismos procesos internos, políticas y estándares de protección de datos personales; y</li>
                      <li>Utilicen los datos personales para finalidades compatibles, análogas o directamente relacionadas con las descritas en el presente Aviso de Privacidad, incluyendo, de manera enunciativa más no limitativa:
                        <ul className="list-[square] pl-6 mt-2 space-y-1 text-slate-500">
                          <li>Desarrollo y operación de plataformas tecnológicas, software y soluciones SaaS.</li>
                          <li>Prestación de servicios legaltech y de consultoría legal.</li>
                          <li>Soporte técnico, comercial, administrativo y operativo.</li>
                          <li>Análisis, mejora, innovación y escalamiento de productos y servicios tecnológicos.</li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
                <p className="mt-4 text-sm text-emerald-500/80 italic">Estas transferencias no requieren consentimiento del titular, al actualizarse lo dispuesto por el artículo 37, fracciones III y VII, de la LFPDPPP.</p>

                {/* Inciso B */}
                <h3 className="text-lg font-bold text-emerald-400 mt-8 mb-3">B) Transferencias a proveedores y terceros encargados</h3>
                <p>Los datos personales podrán ser transferidos a proveedores, prestadores de servicios y terceros que actúen como encargados del tratamiento, estrictamente necesarios para la operación de la plataforma, tales como, de manera enunciativa más no limitativa:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2 text-slate-400">
                  <li>Servicios de hosting, cloud computing y almacenamiento.</li>
                  <li>Proveedores de infraestructura tecnológica.</li>
                  <li>Servicios de mensajería electrónica, SMS, WhatsApp u otros medios de comunicación.</li>
                  <li>Proveedores de inteligencia artificial, procesamiento de lenguaje natural y automatización.</li>
                  <li>Servicios de seguridad informática, auditoría técnica y monitoreo.</li>
                  <li>Plataformas de análisis, métricas y rendimiento.</li>
                </ul>
                <p className="mt-4">Dichos terceros actuarán exclusivamente bajo las instrucciones de JX LABS / JUXA, y estarán obligados contractualmente a:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2 text-slate-400">
                  <li>Tratar los datos personales únicamente para las finalidades autorizadas.</li>
                  <li>Guardar confidencialidad.</li>
                  <li>Implementar medidas de seguridad adecuadas.</li>
                  <li>No utilizar los datos para fines propios.</li>
                </ul>
                <p className="mt-4 text-sm text-emerald-500/80 italic">Estas transferencias se consideran permitidas conforme a la legislación aplicable, al tratarse de encargados necesarios para la prestación del servicio.</p>

                {/* Inciso C */}
                <h3 className="text-lg font-bold text-emerald-400 mt-8 mb-3">C) Transferencias derivadas de relaciones contractuales con clientes</h3>
                <p>Cuando JX LABS / JUXA actúe como encargado del tratamiento, los datos personales podrán ser transferidos:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Al cliente, usuario o entidad que ostente la calidad de responsable del tratamiento, quien mantiene la relación jurídica directa con el titular de los datos personales, para fines de operación, supervisión, control, auditoría, cumplimiento contractual y legal.</li>
                </ul>
                <p className="mt-4">En estos casos, JX LABS / JUXA no decide sobre la finalidad ni el uso último de los datos, limitándose a ejecutar las instrucciones del responsable.</p>

                {/* Inciso D */}
                <h3 className="text-lg font-bold text-emerald-400 mt-8 mb-3">D) Transferencias por obligaciones legales o requerimientos de autoridad</h3>
                <p>Los datos personales podrán ser transferidos a:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Autoridades administrativas, judiciales o regulatorias competentes, nacionales o extranjeras, cuando exista mandato legal, requerimiento fundado y motivado, o sea necesario para la defensa de derechos, cumplimiento de obligaciones legales o atención de procedimientos administrativos o judiciales.</li>
                </ul>

                {/* Inciso E */}
                <h3 className="text-lg font-bold text-emerald-400 mt-8 mb-3">E) Garantías y limitaciones</h3>
                <p>En todos los casos:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2 text-slate-400">
                  <li>No se venden, ceden ni comercializan los datos personales.</li>
                  <li>Las transferencias se realizan únicamente para las finalidades descritas en el presente Aviso.</li>
                  <li>Se adoptan medidas razonables para asegurar que los terceros cumplan con la normatividad aplicable.</li>
                </ul>
                <p className="mt-6 font-bold text-white border-l-2 border-slate-500 pl-4">
                  El titular reconoce y acepta que dichas transferencias son necesarias para la operación, funcionalidad, escalabilidad y continuidad de la plataforma, así como para la prestación de los servicios ofrecidos por JX LABS / JUXA.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4 mb-4">VIII. MEDIDAS DE SEGURIDAD</h2>
                <p>JX LABS / JUXA implementa medidas de seguridad administrativas, técnicas y físicas adecuadas para proteger los datos personales contra daño, pérdida, alteración, destrucción, uso o acceso no autorizado.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4 mb-4">IX. CONSERVACIÓN DE LOS DATOS</h2>
                <p>Los datos personales serán conservados únicamente durante el tiempo necesario para cumplir las finalidades descritas y las obligaciones legales aplicables.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4 mb-4">X. DERECHOS ARCO</h2>
                <p>El titular podrá ejercer sus derechos de Acceso, Rectificación, Cancelación u Oposición mediante solicitud enviada al correo electrónico:</p>
                <p className="mt-6 font-bold text-white border-l-2 border-slate-500 pl-4">contacto@juxa.mx</p>
                <br />
                <p>Cuando JX LABS / JUXA actúe como encargado, la solicitud será canalizada al responsable correspondiente.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4 mb-4">XI. REVOCACIÓN DEL CONSENTIMIENTO</h2>
                <p>El titular podrá revocar su consentimiento conforme al procedimiento ARCO, sin efectos retroactivos.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4 mb-4">XII. USO DE COOKIES Y TECNOLOGÍAS DE RASTREO</h2>
                <p>La plataforma utiliza cookies técnicas, funcionales y analíticas, exclusivamente para operación, seguridad, mejora del servicio y análisis interno, conforme a la normativa aplicable.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4 mb-4">XIII. MODIFICACIONES AL AVISO DE PRIVACIDAD</h2>
                <p>El presente Aviso de Privacidad podrá ser modificado en cualquier momento. Las actualizaciones estarán disponibles en la plataforma oficial de JX LABS / JUXA.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4 mb-4">XIV. LEGISLACIÓN APLICABLE Y CONSENTIMIENTO</h2>
                <p>El presente Aviso se rige por las leyes de los Estados Unidos Mexicanos.</p>
                <p>El uso de la plataforma implica que el titular ha sido informado y, cuando sea legalmente exigible, <strong>otorga su consentimiento expreso</strong> para el tratamiento de sus datos personales conforme al presente Aviso.</p>
              </section>

            </div>
          ) : (
            // --- CONTENIDO: TÉRMINOS Y CONDICIONES ---
            <div className="space-y-8 text-sm md:text-base leading-relaxed text-justify">
              <p>
                Los presentes Términos y Condiciones regulan el acceso, uso y operación de la plataforma tecnológica JX LABS, S.A. DE C.V., conocida comercialmente como "JUXA" (en adelante, la "Plataforma"), así como la prestación de los servicios de consultoría legal, servicios legaltech, desarrollo de software, soluciones SaaS, uso de inteligencia artificial y, en su caso, asesoría personalizada, ofrecidos por el PROVEEDOR, y son complementarios a cualquier contrato, orden de servicio o acuerdo celebrado con el Usuario, los cuales prevalecerán en caso de interpretación.
              </p>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-blue-500 pl-4 mb-4">I. DEFINICIONES Y ALCANCE INTERPRETATIVO</h2>
                <ul className="list-disc pl-6 space-y-4">
                  <li><strong>Plataforma:</strong> Sistema tecnológico, sitio web, aplicaciones, infraestructura digital, software, soluciones SaaS, herramientas de inteligencia artificial y demás recursos informáticos operados por JX LABS/JUXA.</li>
                  <li><strong>Proveedor:</strong> JX LABS, S.A. DE C.V., conforme a los datos de identificación publicados en la Plataforma.</li>
                  <li><strong>Usuario:</strong> Persona física o moral que accede, utiliza o contrata los servicios ofrecidos por el PROVEEDOR.</li>
                  <li><strong>Servicios:</strong> Servicios de consultoría legal, orientación jurídica, análisis informativo, desarrollo y uso de herramientas tecnológicas, soluciones legaltech, software, inteligencia artificial y, en su caso, asesoría personalizada prestada por personal humano.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-blue-500 pl-4 mb-4">II. NATURALEZA DEL SERVICIO Y ALCANCE OPERATIVO</h2>
                <p>JX LABS / JUXA es una plataforma legaltech que ofrece servicios de apoyo, orientación y consultoría legal mediante el uso de herramientas digitales, tecnologías automatizadas, inteligencia artificial y, cuando así se contrate, asesoría personalizada por personas especialistas.</p>
                <p className="mt-4 font-bold">El Usuario reconoce expresamente que JX LABS / JUXA:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>No es autoridad judicial ni administrativa.</li>
                  <li>No sustituye la asesoría legal personalizada de un abogado.</li>
                  <li>No emite resoluciones con efectos jurídicos obligatorios.</li>
                  <li>No asume representación legal automática del Usuario.</li>
                </ul>
                <p className="mt-4">Los servicios prestados son servicios de medios y no de resultados, por lo que no se garantiza la obtención de resoluciones favorables, criterios específicos, sentencias, acuerdos, contratos o resultados jurídicos determinados. Toda decisión final basada en la información, análisis o herramientas proporcionadas por la Plataforma corresponde exclusivamente al Usuario.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-blue-500 pl-4 mb-4">III. MODALIDADES DEL SERVICIO</h2>
                <p>El Usuario podrá acceder a los servicios bajo las siguientes modalidades:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong>a)</strong> Uso de la plataforma tecnológica con inteligencia artificial, destinada a orientación general, análisis informativo, generación de contenido y apoyo en la toma de decisiones.</li>
                  <li><strong>b)</strong> Servicio de asesoría personalizada, consistente en la atención directa por una persona especialista asignada por el PROVEEDOR.</li>
                </ul>
                <p className="mt-4">El Usuario reconoce que la modalidad contratada define el alcance del servicio y las responsabilidades aplicables.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-blue-500 pl-4 mb-4">IV. USO DE TECNOLOGÍAS AVANZADAS E INTELIGENCIA ARTIFICIAL</h2>
                <p>Las herramientas de inteligencia artificial utilizadas por JX LABS / JUXA constituyen herramientas de apoyo tecnológico, no sustituyen el criterio humano ni garantizan resultados jurídicos específicos. Cuando el Usuario decida utilizar exclusivamente las herramientas automatizadas, asume la responsabilidad total de las decisiones, usos y consecuencias derivadas de dicha información, liberando al PROVEEDOR de cualquier responsabilidad.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-blue-500 pl-4 mb-4">V. ACCESO A LA PLATAFORMA Y SEGURIDAD</h2>
                <p>El acceso a la Plataforma requiere credenciales personales e intransferibles. El Usuario es responsable del uso, custodia y confidencialidad de sus accesos. El PROVEEDOR implementa medidas razonables de seguridad, sin garantizar la inexistencia absoluta de riesgos tecnológicos.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-blue-500 pl-4 mb-4">VI. RESTABLECIMIENTO DE CONTRASEÑA</h2>
                <p>El restablecimiento de contraseñas se realizará mediante los mecanismos habilitados en la Plataforma. El PROVEEDOR no será responsable por imposibilidad de recuperación derivada de información incorrecta o desactualizada proporcionada por el Usuario.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-blue-500 pl-4 mb-4">VII. OBLIGACIONES DEL USUARIO</h2>
                <p>El Usuario se obliga a:</p>
                <ol className="list-decimal pl-6 space-y-2 mt-2">
                  <li>Proporcionar información veraz y actualizada.</li>
                  <li>Utilizar la Plataforma de forma lícita.</li>
                  <li>Abstenerse de usar la Plataforma para fines ilegales.</li>
                  <li>No vulnerar sistemas, seguridad o derechos de terceros.</li>
                  <li>Cumplir con los pagos, suscripciones o contraprestaciones pactadas.</li>
                </ol>
                <p className="mt-4 text-emerald-400">El incumplimiento podrá dar lugar a la suspensión o terminación del servicio.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-blue-500 pl-4 mb-4">VIII. PRECIO, SUSCRIPCIONES Y PAGOS</h2>
                <p>Los precios, planes, suscripciones y contraprestaciones serán los publicados en la Plataforma o pactados contractualmente. El PROVEEDOR podrá modificar precios o planes, notificándolo previamente por medios electrónicos.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-blue-500 pl-4 mb-4">IX. LIMITACIÓN DE RESPONSABILIDAD</h2>
                <p>El PROVEEDOR no será responsable por:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Decisiones jurídicas tomadas por el Usuario.</li>
                  <li>Interpretaciones legales erróneas.</li>
                  <li>Resultados desfavorables.</li>
                  <li>Uso indebido de la información proporcionada.</li>
                  <li>Actos u omisiones del Usuario o de terceros.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-blue-500 pl-4 mb-4">X. SUSPENSIÓN Y TERMINACIÓN DEL SERVICIO</h2>
                <p>El PROVEEDOR podrá suspender o terminar el acceso del Usuario por:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Incumplimiento de pagos.</li>
                  <li>Uso indebido de la Plataforma.</li>
                  <li>Violación a estos Términos.</li>
                </ul>
                <p className="mt-4">Sin perjuicio de las obligaciones económicas previamente generadas.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white border-l-4 border-blue-500 pl-4 mb-4">XI a XVII. DISPOSICIONES FINALES</h2>
                <ul className="list-disc pl-6 space-y-4">
                  <li><strong>Confidencialidad y Datos Personales:</strong> El tratamiento de datos personales se realizará conforme al Aviso de Privacidad vigente de JX LABS / JUXA, el cual forma parte integrante de estos Términos.</li>
                  <li><strong>Evidencia Digital:</strong> Toda la información, registros, bitácoras, direcciones IP, marcas de tiempo y actividad generada en la Plataforma constituirá evidencia digital válida.</li>
                  <li><strong>Comunicaciones Electrónicas:</strong> El Usuario acepta que todas las comunicaciones se realicen por medios electrónicos.</li>
                  <li><strong>Modificaciones:</strong> El PROVEEDOR podrá modificar estos Términos en cualquier momento. Las modificaciones se publicarán en la Plataforma y no tendrán efectos retroactivos.</li>
                  <li><strong>Legislación y Jurisdicción:</strong> Se aplicarán las leyes de los Estados Unidos Mexicanos. Las partes se someten a los tribunales competentes de la Ciudad de México.</li>
                  <li><strong>Vigencia:</strong> Los presentes Términos y Condiciones permanecerán vigentes mientras el Usuario haga uso de la Plataforma o mantenga activa la relación con el PROVEEDOR.</li>
                </ul>
              </section>

              
            </div>
          )}

        </div>
      </div>
    </div>
  );
};