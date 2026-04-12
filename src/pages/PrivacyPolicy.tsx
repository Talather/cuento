import { Card, CardContent } from "@/components/ui/card";
import { PrintStoryButton } from "@/components/print/PrintStoryButton";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="pt-6 text-left">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Política de Privacidad</h1>
            <PrintStoryButton storyId="309a297d-3f2e-4cd0-ab67-3d76b5c264f7" />
          </div>
          
          <div className="prose max-w-none">

          <p className="mb-4">Esta política de privacidad describe cómo recopilamos, usamos y divulgamos información personal sobre nuestros usuarios. Nuestro objetivo es garantizar que la información personal de nuestros usuarios esté protegida y mantenida en confidencialidad.</p>
            <h2 className="text-xl font-semibold mt-6 mb-4">Recopilación de información personal</h2>
            <p className="mb-4">La aplicación solo recopila información personal que es proporcionada voluntariamente por sus usuarios. Esta información puede incluir su nombre, dirección de correo electrónico y cualquier otra información que proporcione al utilizar la aplicación. También podemos recopilar información sobre su dispositivo, como el tipo de dispositivo y el sistema operativo.</p>
            <h2 className="text-xl font-semibold mt-6 mb-4">Uso de información personal</h2>
            <p className="mb-4">La información personal recopilada por la aplicación solo se utilizará con el fin de brindar una experiencia mejor y más personalizada para nuestros usuarios. La información también puede utilizarse para responder a consultas, enviar notificaciones sobre nuevas características o enviar otra información que pueda ser de interés para nuestros usuarios.</p>
            <h2 className="text-xl font-semibold mt-6 mb-4">Divulgación de información personal</h2>
            <p className="mb-4">No venderemos, alquilaremos ni compartiremos su información personal con terceros a menos que se nos requiera por ley hacerlo. </p>
            <h2 className="text-xl font-semibold mt-6 mb-4">Seguridad de la información personal</h2>
            <p className="mb-4">Tomamos en serio la protección de la información personal y tomamos todas las medidas razonables para prevenir el acceso no autorizado o la divulgación de información personal. La aplicación está diseñada con medidas de seguridad para ayudar a proteger la información personal de nuestros usuarios.</p>
            <h2 className="text-xl font-semibold mt-6 mb-4">Retención de información personal</h2>
            <p className="mb-4">La información personal recopilada por la aplicación se mantendrá durante el tiempo necesario para cumplir con el propósito para el cual se recopiló o según lo requerido por la ley.</p>
            <h2 className="text-xl font-semibold mt-6 mb-4">Acceso y actualización de información personal</h2>
            <p className="mb-4">Los usuarios pueden solicitar acceder y actualizar su información personal en cualquier momento, poniéndose en contacto con nosotros.</p>
            <h2 className="text-xl font-semibold mt-6 mb-4">Cambios en esta Política de privacidad</h2>
            <p className="mb-4">Nos reservamos el derecho de cambiar esta Política de privacidad en cualquier momento. Cualquier cambio se publicará en esta página y entrará en vigor de inmediato. Si hay alguna pregunta o inquietud sobre esta Política de privacidad, por favor, ponerse en contacto con nosotros.</p>
            <h2 className="text-xl font-semibold mt-6 mb-4">Información de contacto</h2>
            <p className="mb-4">Para cualquier pregunta o inquietud sobre esta Política de privacidad o la recopilación y uso de información personal por la aplicación, por favor, ponerse en contacto con nosotros a través de cuentito@cuenti.to.</p>
            <p className="mb-4">Fecha de efectividad: Enero de 2023.</p>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
