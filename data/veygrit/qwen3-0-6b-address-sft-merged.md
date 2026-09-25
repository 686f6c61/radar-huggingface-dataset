# veygrit/qwen3-0.6b-address-sft-merged

## Resumen

veygrit/qwen3-0.6b-address-sft-merged es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3-0.6B, publicado por el usuario veygrit en HuggingFace. Se trata de un modelo denso, decoder-only, de aproximadamente 0,6 mil millones de parametros (596.049.920 reales segun los pesos safetensors), derivado de la familia Qwen3 y entrenado con TRL segun la model card del checkpoint antecesor (veygrit/qwen3-0.6b-address-sft). El sufijo "merged" indica que los adaptadores del entrenamiento supervisado (SFT) se han fusionado en los pesos base, de modo que el repositorio contiene un modelo autonomo listo para cargar con transformers.

Su relevancia actual es la de los modelos pequenos de ultima generacion: permiten inferencia en CPU, movil y GPUs de gama de entrada, con coste casi nulo, algo critico para despliegues en produccion con requisitos de latencia o privacidad. La informacion publicada sobre este checkpoint concreto es practicamente inexistente: la model card es la plantilla autogenerada de HuggingFace, sin datos de desarrollador, licencia, idiomas, datos de entrenamiento ni evaluacion.

Por tanto, esta ficha distingue de forma explicita entre los datos verificables del repositorio (parametros, formato, tamano, procedencia) y los datos heredados de la familia Qwen3, que se citan como referencia del modelo base y no como caracteristicas confirmadas de este derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-0.6B); no detallada en la model card de este repositorio |
| Parametros totales | 596.049.920 (dato real de los pesos safetensors, aproximadamente 0,6 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No confirmada en este repositorio. El modelo base Qwen3-0.6B declara 32.768 tokens nativos, extensibles con YaRN segun la documentacion de la familia Qwen3 |
| Tipos de cuantizacion | No se distribuyen cuantizaciones en el repositorio. Al publicarse en safetensors, es tecnicamente posible generar GGUF, AWQ o GPTQ con herramientas estandar, pero no hay versiones publicadas ni verificadas |
| Idiomas soportados | No disponible. La model card no declara idiomas; el modelo base Qwen3-0.6B se documenta como multilingue |
| Licencia | No disponible. Los metadatos de HuggingFace y la model card no especifican licencia para este derivado; el modelo base Qwen3-0.6B se publica bajo Apache 2.0 segun su propia ficha |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 2,4 GB (consistente con pesos en fp32 para 596 M de parametros; el dtype exacto no esta confirmado en la model card) |
| Tarea declarada | text-generation (pipeline de HuggingFace) |
| Fecha de publicacion | 25 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

La arquitectura no esta descrita en la model card de este repositorio. Por procedencia, el checkpoint hereda el diseno de Qwen/Qwen3-0.6B: un transformer decoder-only denso de la familia Qwen3, que segun el informe tecnico de Qwen3 (arXiv:2505.09388) cubre escalas de 0,6 a 235 mil millones de parametros en variantes densas y de mezcla de expertos (MoE), e integra modos de pensamiento (thinking) y no pensamiento en un marco unificado. Este derivado concreto no declara si conserva el modo de razonamiento explicito ni si se ha desactivado durante el ajuste.

Sobre el entrenamiento solo es verificable lo indicado en la ficha del checkpoint antecesor: es un ajuste fino de Qwen/Qwen3-0.6B realizado con TRL, presumiblemente mediante SFT (supervised fine-tuning) supervisado, y posteriormente fusionado en los pesos base para dar lugar a este repositorio "merged". No se especifican el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, ni los hiperparametros utilizados. El nombre del checkpoint sugiere un ajuste orientado a tareas relacionadas con direcciones (address), probablemente normalizacion, parsing o extraccion de direcciones postales, pero esta interpretacion no esta confirmada por ninguna fuente publicada.

## Capacidades

- Generacion de texto conversacional: la pipeline declarada es text-generation y el tag conversational aparece en los metadatos del repositorio.
- Razonamiento y conocimiento general: limitados por el tamano del modelo (0,6 B de parametros); el modelo base Qwen3-0.6B se documenta con capacidades de comprension del lenguaje, generacion, codigo y matematicas, pero no hay evaluacion publicada de este derivado.
- Ajuste especifico de dominio: por el nombre del checkpoint, cabe esperar un comportamiento especializado en tareas ligadas a direcciones (normalizacion, estructuración o extraccion), sin confirmacion documental.
- Tool calling y function calling: no disponible; no se documenta soporte de herramientas en este repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible en la model card; el modelo base Qwen3 incorpora modos de razonamiento, pero no se confirma su presencia en este ajuste.
- Capacidades multilingues: no declaradas para este derivado.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Normalizacion y parsing de direcciones postales: dado el nombre del checkpoint, el uso mas plausible es convertir direcciones en texto libre a una estructura canonica (calle, numero, codigo postal, municipio, provincia) para alimentar sistemas de logistica o CRM. Requiere validacion previa, ya que no hay evaluacion publicada de esta tarea.
- Extraccion de entidades en documentos: con 0,6 B de parametros y ejecucion local, sirve para preprocesar formularios, facturas o albaranes y extraer campos estructurados sin enviar datos a terceros.
- Asistentes embebidos en dispositivo: al caber en memoria de moviles y equipos sin GPU dedicada (menos de 1 GB en cuantizacion de 4 bits), permite chatbots locales sin conexion para aplicaciones de privacidad estricta.
- Clasificacion y enrutado de tickets: el modelo puede etiquetar consultas entrantes por categoria o urgencia en pipelines de soporte, como primera etapa antes de un modelo mayor.
- Preprocesamiento en pipelines RAG: generacion de consultas reformuladas, resumen de fragmentos cortos o filtrado de contexto antes de pasarlos a un modelo de mayor tamano.
- Prototipado rapido y pruebas de concepto: coste de inferencia minimo en CPU, adecuado para validar ideas de producto o para tests automatizados en CI sin coste de API.
- Generacion de texto corto y plantillas: respuestas breves, descripciones o textos de formulario donde no se requiere razonamiento profundo.
- Investigacion sobre ajuste fino eficiente: al ser un SFT fusionado de un modelo pequeno, sirve como caso de estudio reproducible de pipelines TRL con merge de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es la plantilla autogenerada de HuggingFace y su seccion de evaluacion esta vacia. Tampoco la ficha del checkpoint antecesor (veygrit/qwen3-0.6b-address-sft) aporta metricas; solo indica que se trata de un ajuste fino de Qwen/Qwen3-0.6B entrenado con TRL.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Evaluacion de tareas de direcciones | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (596 M de parametros): aproximadamente 2,4 GB en fp32 (tamano real del repositorio), 1,2 GB en fp16/bf16, 0,6 GB en int8 y 0,35-0,45 GB en cuantizacion de 4 bits (Q4_K_M o similar).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en fp16; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan sobradamente y quedan limitadas por el resto del pipeline, no por el modelo.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo de los ultimos ocho anos, e incluso en iGPU con memoria compartida usando cuantizacion.
- CPU y movil: viable en CPU moderna con llama.cpp u ONNX Runtime; Qualcomm documenta Qwen3-0.6B en su AI Hub para despliegue en dispositivos Snapdragon, aunque no se confirma que este derivado concreto haya sido validado alli.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (el repositorio incluye el tag endpoints_compatible), vLLM, llama.cpp y Ollama (requieren convertir los pesos a GGUF, paso no publicado).
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni en la model card ni en fuentes consultadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Disponibilidad |
|---|---|---|---|---|---|
| veygrit/qwen3-0.6b-address-sft-merged | 596.049.920 | no disponible en la ficha | no disponible | Ajuste SFT fusionado, denso | Repositorio HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| veygrit/qwen3-0.6b-address-sft | no disponible | no disponible | no disponible | Adaptador SFT sobre Qwen3-0.6B, entrenado con TRL | Repositorio HuggingFace |
| Qwen/Qwen3-0.6B | 0,6 mil millones | 32.768 tokens nativos segun la documentacion de Qwen3, extensible con YaRN | Apache 2.0 (segun la ficha de Qwen) | Transformer denso, decoder-only, con modos thinking y non-thinking | Repositorio HuggingFace; tambien en Qualcomm AI Hub y Microsoft Foundry |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe arquitectura, datos de entrenamiento, hiperparametros ni uso previsto, lo que impide auditar el modelo.
- Sin evaluacion publicada: no existe ningun benchmark que permita estimar su calidad real ni compararla con alternativas, ni siquiera en la tarea de direcciones que sugiere su nombre.
- Riesgo elevado de alucinacion: los modelos de 0,6 B de parametros generan con frecuencia contenido plausible pero incorrecto, especialmente en tareas de extraccion donde un valor inventado puede ser indistinguible de uno correcto.
- Sesgos desconocidos: al no declararse la composicion del dataset de ajuste, no es posible evaluar sesgos demograficos, geograficos o linguisticos. En un modelo orientado a direcciones, los sesgos geograficos (formatos postales de un solo pais) son un riesgo plausible.
- Sobreajuste probable al dominio de ajuste: un SFT pequeno y especializado tiende a degradar las capacidades generales del modelo base fuera de la tarea objetivo.
- Ambito e idioma sin declarar: no se especifica que idiomas soporta el ajuste; el comportamiento en castellano no esta validado.
- Riesgo legal por licencia: el repositorio no declara licencia, por lo que no hay autorizacion explicita de uso comercial para estos pesos. Aunque el modelo base Qwen3-0.6B se publica bajo Apache 2.0, la ausencia de licencia en el derivado es un problema para produccion y conviene contactar con el autor o asumir el riesgo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento ni issues que permitan juzgar su fiabilidad.
- Formato unico: solo safetensors; no hay versiones cuantizadas listas para llama.cpp, Ollama o GPUs con poca memoria, lo que obliga a un paso previo de conversion.
- Longitud de contexto no confirmada: no se puede asumir que el ajuste conserve la ventana completa del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/veygrit/qwen3-0.6b-address-sft-merged
- Checkpoint antecesor (SFT): https://huggingface.co/veygrit/qwen3-0.6b-address-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Ficha de Qwen3-0.6B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_0_6b
- Catalogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3-0.6b
- Lacoste et al. (2019), Machine Learning Impact calculator: https://arxiv.org/abs/1910.09700 y https://mlco2.github.io/impact#compute
