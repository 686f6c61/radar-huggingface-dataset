# vikeeai/opus-mt-en-zh

## Resumen

`vikeeai/opus-mt-en-zh` es una conversion a ONNX del modelo de traduccion automatica `Helsinki-NLP/opus-mt-en-zh`, publicada por el usuario vikeeai con el objetivo de hacerlo compatible con Transformers.js y, por tanto, ejecutable directamente en el navegador mediante WebML. No se trata de un modelo entrenado desde cero, sino de una redistribucion de pesos en formato ONNX del modelo original de la familia OPUS-MT desarrollada por el grupo Language Technology de la Universidad de Helsinki.

El modelo subyacente es un transformer encoder-decoder de arquitectura Marian, especializado en traduccion de ingles a chino. La familia OPUS-MT se entreno sobre corpus paralelos extraidos de OPUS, una coleccion de datasets de traduccion de dominio publico, y esta pensada para traduccion de proposito general con un tamano compacto que permite despliegue en entornos con recursos limitados.

Su relevancia actual radica en el formato: al incluir pesos ONNX estructurados en una subcarpeta `onnx`, el modelo puede cargarse con Transformers.js en aplicaciones web sin necesidad de backend, lo que facilita traduccion local en el cliente, con privacidad de datos y sin coste de inferencia en servidor. El repositorio ocupa aproximadamente 0,5 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX; el modelo base admite cuantizacion, pero no se detalla en la informacion) |
| Idiomas soportados | ingles y chino (direccion en a zh, segun el identificador del modelo base) |
| Licencia | no disponible |
| Formato de pesos | ONNX (subcarpeta `onnx`), compatible con Transformers.js |

## Arquitectura y entrenamiento

La arquitectura corresponde a Marian, un modelo seq2seq de tipo transformer con encoder y decoder, desarrollado originalmente en el marco del proyecto OPUS-MT. Marian esta disenado para traduccion automatica neuronal con un equilibrio entre calidad y eficiencia computacional, lo que lo hace adecuado para despliegue en entornos con recursos modestos. El modelo base `Helsinki-NLP/opus-mt-en-zh` se entreno sobre pares de frases ingles-chino procedentes de corpus paralelos de OPUS.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de ajuste fino como RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la conversion a ONNX para inferencia web. La conversion a ONNX se realizo presumiblemente con Optimum, segun la recomendacion incluida en la model card, aunque no se especifica la herramienta exacta ni la version.

## Capacidades

- Traduccion de texto de ingles a chino, tarea principal del modelo.
- Generacion de texto seq2seq condicionada a la entrada (pipeline `text2text-generation`).
- Ejecucion en navegador mediante Transformers.js y pesos ONNX, sin backend.
- Inferencia local en el cliente, lo que permite procesar texto sin enviarlo a un servidor.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multimodales (vision, audio) ni modo de pensamiento.
- El soporte multilingue se limita al par ingles-chino segun el identificador del modelo base.

## Casos de uso

- Traduccion en el navegador de contenido web: integracion del modelo con Transformers.js para traducir articulos o formularios de ingles a chino directamente en el cliente, sin enviar el texto a un servidor y preservando la privacidad del usuario.
- Extensiones de navegador para lectura bilingue: uso del modelo ONNX para traducir parrafos seleccionados al chino en tiempo real, aprovechando que los pesos se cargan una sola vez y la inferencia es local.
- Preprocesado de documentacion tecnica: traduccion de README, issues o documentacion de proyectos de software del ingles al chino dentro de un pipeline de CI/CD o en una herramienta de escritorio, sin depender de APIs externas.
- Prototipado rapido de funcionalidades de traduccion: al ser un modelo compacto en ONNX, permite validar una funcionalidad de traduccion en una aplicacion web antes de invertir en infraestructura de servidor.
- Aplicaciones offline o de baja conectividad: despliegue en entornos donde no hay acceso a APIs de traduccion en la nube, como kioscos, dispositivos embebidos con WebML o aplicaciones de escritorio con Electron.
- Traduccion de contenido generado por usuarios en comunidades: procesamiento local de mensajes o comentarios en ingles para mostrarlos en chino a usuarios de habla china, reduciendo costes de API y latencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,5 GB, por lo que los pesos en ONNX caben en memoria de GPU consumer de gama baja o incluso en memoria de navegador.
- GPU recomendadas: al ser un modelo compacto, puede ejecutarse en GPUs consumer como RTX 3060, RTX 4060 o superiores; tambien es viable en CPU.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 2-4 GB de memoria disponible, aunque no se documentan cifras exactas.
- Opciones de despliegue: Transformers.js (navegador), ONNX Runtime, y potencialmente llama.cpp u otras herramientas compatibles con ONNX; no se documenta soporte especifico para vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vikeeai/opus-mt-en-zh | no disponible | no disponible | no disponible | ONNX | Hugging Face |
| Helsinki-NLP/opus-mt-en-zh | no disponible | no disponible | no disponible | safetensors/PyTorch | Hugging Face |
| Helsinki-NLP/opus-mt-zh-en | no disponible | no disponible | no disponible | safetensors/PyTorch | Hugging Face |
| Otros modelos OPUS-MT en a zh | no disponible | no disponible | no disponible | safetensors/PyTorch | Hugging Face |

La comparativa se limita a variantes de la misma familia OPUS-MT, ya que no se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la informacion proporcionada. La diferencia principal frente al modelo base es el formato ONNX, orientado a inferencia web.

## Limitaciones y advertencias

- La licencia no esta disponible en la informacion proporcionada, lo que impide confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base `Helsinki-NLP/opus-mt-en-zh` antes de usarlo en produccion.
- El modelo solo cubre la direccion ingles a chino; no soporta otras direcciones ni otros pares de idiomas.
- Al ser una conversion de pesos, hereda las limitaciones del modelo base, pero no se documentan sesgos especificos ni tasas de alucinacion.
- La calidad de traduccion en dominios especializados (medico, legal, tecnico) no esta documentada y podria ser limitada.
- El repositorio no registra descargas ni interacciones, lo que sugiere que no ha sido validado por la comunidad; conviene probarlo antes de adoptarlo.
- La model card advierte que mantener repositorios separados para pesos ONNX es una solucion temporal hasta que WebML gane adopcion, por lo que la estructura del repositorio podria cambiar.
- No se documenta el contexto maximo soportado, lo que limita la planificacion de cargas de trabajo con textos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vikeeai/opus-mt-en-zh
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-zh
- Documentacion de Optimum: https://huggingface.co/docs/optimum/index
- Transformers.js: https://huggingface.co/docs/transformers.js
