# thedemiurge/nuqta-arabic-ocr-demo

## Resumen

Nuqta Arabic OCR Demo es una aplicacion Gradio desplegada en Hugging Face Spaces por el usuario thedemiurge, que actua como interfaz web de demostracion para la familia de modelos Nuqta Arabic OCR desarrollada por SalahALHaismawi. No se trata de un modelo de pesos en si, sino de un Space (sdk gradio 5.50.0, app_file app.py) que envuelve los modelos Nuqta-Arabic-OCR-4B y Nuqta-Arabic-OCR-0.8B para ofrecer reconocimiento optico de caracteres sobre arabe con preservacion fiel del tashkeel (los signos diacriticos del arabe). El problema que aborda es la transcripcion de documentos arabes impresos donde los diacriticos deben reproducirse tal como aparecen impresos, sin inferencia ni correccion silenciosa.

La propuesta diferencial es el modo `as-written`, que transcribe el tashkeel solo donde esta impreso, frente a enfoques que lo predicen o lo eliminan. Ademas incorpora modos `bare` (sin diacriticos), `markdown` (titulos, listas y tablas HTML) y `id` (extraccion estructurada de campos de documentos de identidad y pasaportes, con MRZ y digitos de control ICAO, y decodificacion del DNI egipcio). El demo corre sobre ZeroGPU, por lo que no requiere hardware propio para probarlo.

La relevancia actual reside en que cubre un nicho poco atendido: OCR arabe de calidad con diacriticos y validacion estructural de documentos de identidad, empaquetado en una libreria Python (`nuqta`, Apache-2.0) que puede ejecutarse tambien de forma local como watcher de carpeta. La informacion disponible no detalla arquitectura, parametros ni datos de entrenamiento de los modelos subyacentes; esta ficha se limita a lo que la model card del Space documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el Space es una app Gradio; delega en los modelos Nuqta-Arabic-OCR-4B y Nuqta-Arabic-OCR-0.8B) |
| Parametros totales | no disponible (los nombres de los modelos sugieren variantes de 4B y 0.8B, sin confirmacion tecnica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (OCR); lista completa de idiomas no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el Space expone la libreria `nuqta` y acepta hub id o ruta local) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura de los modelos Nuqta-Arabic-OCR-4B y Nuqta-Arabic-OCR-0.8B en la documentacion proporcionada. La model card del Space describe unicamente la capa de aplicacion: una app Gradio 5.50.0 sobre ZeroGPU que carga uno de los dos modelos (4B para maxima precision, 0.8B para velocidad) y expone una API Python mediante la clase `OCR` del paquete `nuqta`.

El paquete `nuqta` se distribuye bajo Apache-2.0 y procede del Space original de SalahALHaismawi. Acepta como entrada un hub id (`nuqta-0.8b`, `nuqta-4b`), un identificador de Hugging Face o una ruta local, y ofrece metodos `read()` sobre imagenes y PDF con modos de salida configurables. No se documentan tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF/DPO) ni innovaciones de atencion o decodificacion. Tampoco se detalla el mecanismo interno que garantiza la fidelidad del tashkeel mas alla de la descripcion funcional del modo `as-written`.

## Capacidades

- OCR de arabe impreso con preservacion fiel del tashkeel (diacriticos tal como aparecen impresos, sin prediccion).
- Modo `bare`: transcripcion sin diacriticos.
- Modo `markdown`: reconstruccion de estructura documental con titulos, listas y tablas HTML.
- Modo `id`: extraccion estructurada de campos de documentos de identidad y pasaportes, incluyendo MRZ con digitos de control ICAO y decodificacion del DNI egipcio.
- Tratamiento explicito de fallos de validacion: si un digito de control no cuadra, el campo se marca para revision humana sin correccion silenciosa.
- Entrada de imagenes (fotos, escaneos) y PDF.
- Procesamiento por lotes mediante watcher de carpeta local (`watch.py` + unidad systemd `nuqta-drop.service`), sin salida de datos de la maquina.
- API Python programatica a traves de `nuqta.OCR`.
- No se documentan capacidades de tool calling, agentes, vision general, audio ni modo de razonamiento extendido.

## Casos de uso

- Digitalizacion de libros y documentos arabes con diacriticos: el modo `as-written` permite transcribir textos religiosos, poeticos o academicos donde el tashkeel impreso es informacion relevante, sin que el modelo lo invente ni lo elimine.
- Extraccion de datos de pasaportes y documentos de identidad: el modo `id` devuelve campos estructurados con validacion de digitos de control ICAO, adecuado para procesos KYC donde un fallo de validacion debe derivarse a revision humana.
- Conversion de escaneos a Markdown estructurado: el modo `markdown` reconstruye titulos, listas y tablas HTML, util para migrar documentacion arabe a wikis, bases de conocimiento o pipelines de indexacion.
- Procesamiento por lotes en local con privacidad: el watcher de carpeta `~/NuqtaDrop/` genera transcripciones `.md` junto a cada archivo sin enviar datos a la nube, apropiado para entornos con requisitos de confidencialidad.
- Automatizacion de archivo documental: integracion de la clase `OCR` en scripts Python para procesar lotes de PDF e imagenes y almacenar el texto resultante en un repositorio documental.
- Prototipado rapido de aplicaciones de document AI en arabe: el Space sobre ZeroGPU permite evaluar la calidad del OCR sin aprovisionar GPU, antes de decidir un despliegue propio con el modelo 4B o 0.8B.
- Verificacion de identidad en onboarding digital: el modo `id` con decodificacion del DNI egipcio y MRZ facilita la validacion automatizada de documentos en flujos de alta de usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El Space se ejecuta sobre ZeroGPU, sin requisitos de hardware para el usuario final del demo.
- Para despliegue local, la model card no especifica VRAM ni GPU recomendadas para las variantes de 4B y 0.8B; no disponible.
- No se confirma si las variantes caben en GPU de consumo; el nombre `0.8B` sugiere que la variante pequena podria ser viable en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue documentadas: app Gradio (Space), libreria Python `nuqta` con `OCR(...)` y watcher de carpeta local via `watch.py` y unidad systemd de usuario.
- No se documentan latencia ni throughput estimados.
- No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con otras soluciones de OCR arabe.

## Limitaciones y advertencias

- El repositorio es un Space de demostracion, no un modelo con pesos publicados en este ID; para uso en produccion debe acudirse a los modelos Nuqta-Arabic-OCR-4B y Nuqta-Arabic-OCR-0.8B y al paquete `nuqta`.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de robustez.
- El alcance linguistico documentado es el arabe; no hay informacion sobre otros idiomas.
- La decodificacion del DNI esta limitada, segun la documentacion, al DNI egipcio; otras jurisdicciones no estan cubiertas de forma explicita.
- El modo `id` no corrige silenciosamente: los fallos de digito de control se derivan a revision humana, lo que implica que el pipeline debe gestionar esos casos.
- No se especifican limitaciones de longitud de contexto ni de tamano de pagina o PDF.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de datos tecnicos y de benchmarks impide garantizar niveles de calidad para produccion sin evaluacion propia.
- El Space se creo y actualizo el 2026-11-24 y registra 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Space en Hugging Face: https://huggingface.co/thedemiurge/nuqta-arabic-ocr-demo
- Modelo Nuqta-Arabic-OCR-4B: https://huggingface.co/SalahALHaismawi/Nuqta-Arabic-OCR-4B
- Modelo Nuqta-Arabic-OCR-0.8B: https://huggingface.co/SalahALHaismawi/Nuqta-Arabic-OCR-0.8B
- Space original de Nuqta Arabic OCR: https://huggingface.co/spaces/SalahALHaismawi/Nuqta-Arabic-OCR
- Coleccion Nuqta OCR: https://huggingface.co/collections/SalahALHaismawi/nuqta-ocr-6ad4af255195b706ac93d1d4
- Perfil del autor del demo: https://huggingface.co/thedemiurge
