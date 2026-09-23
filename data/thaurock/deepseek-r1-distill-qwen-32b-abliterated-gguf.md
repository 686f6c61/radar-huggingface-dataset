# Thaurock/DeepSeek-R1-Distill-Qwen-32B-abliterated-GGUF

## Resumen

Thaurock/DeepSeek-R1-Distill-Qwen-32B-abliterated-GGUF es un repositorio de cuantizaciones GGUF del modelo huihui-ai/DeepSeek-R1-Distill-Qwen-32B-abliterated, que a su vez deriva del DeepSeek-R1-Distill-Qwen-32B oficial de DeepSeek. Se trata de un modelo denso de 32,8B parametros basado en la familia Qwen-32B, destilado a partir de DeepSeek-R1 para incorporar cadenas de razonamiento extensas mediante la etiqueta `<think>`, y posteriormente sometido a un proceso de *abliteration* que elimina las direcciones de rechazo y los filtros de seguridad aprendidos durante el alineamiento.

El repositorio cubre un hueco habitual en el ecosistema: frente a subidas parciales de GGUF, ofrece el espectro completo de 11 cuantizaciones, desde F16 (16,00 BPW) hasta Q2_K (2,90 BPW), lo que permite ajustar el modelo a practicamente cualquier presupuesto de VRAM o RAM manteniendo —segun el autor— la coherencia del arbol de razonamiento. Los puntos dulces recomendados por el propio autor son Q5_K_M y Q4_K_M, que ocupan aproximadamente 23,4 GB y 19,9 GB respectivamente.

Es relevante ahora por dos motivos. Primero, permite ejecutar un modelo de razonamiento de 32B en hardware de consumo avanzado (una RTX 4090 de 24 GB, por ejemplo) mediante llama.cpp, Ollama, LM Studio o Text-Generation-WebUI. Segundo, su naturaleza abliterada lo convierte en una pieza util para investigacion en seguridad, red teaming y estudio del comportamiento de modelos sin capas de rechazo. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen-32B, destilado de DeepSeek-R1) |
| Parametros totales | 32,8B (segun nota del autor sobre el peso nativo en safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (11 archivos, sin splits) |
| Modelo base | huihui-ai/DeepSeek-R1-Distill-Qwen-32B-abliterated |
| Pipeline | text-generation |
| Autor del repositorio | Thaurock |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen de 32B, escogido por DeepSeek como base para uno de sus seis modelos destilados de DeepSeek-R1. El entrenamiento original combina la destilacion de las trazas de razonamiento producidas por DeepSeek-R1 sobre un backbone Qwen, lo que traslada a un modelo denso la capacidad de generar cadenas de pensamiento largas antes de emitir la respuesta final. El modelo resultante se caracteriza por superar a OpenAI-o1-mini en diversos benchmarks, segun la documentacion oficial de DeepSeek, y por establecer un nuevo estado del arte entre los modelos densos de tamano comparable.

Sobre esa base, huihui-ai aplico *abliteration*, una tecnica que identifica y sustrae las direcciones latentes asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder ante prompts que el modelo alineado rechazaria. Thaurock no ha reentrenado ni modificado los pesos mas alla del proceso de cuantizacion: su aportacion es la conversion completa a GGUF en 11 niveles de precision, con foco en reproducibilidad del arbol de razonamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de destilacion ni si se aplicaron etapas adicionales de RLHF o DPO especificas para esta variante abliterada.

## Capacidades

- Generacion de texto general con soporte de conversacion multi-turno.
- Razonamiento profundo mediante cadenas de pensamiento explicitas delimitadas por la etiqueta `<think>`, herencia directa de la destilacion de DeepSeek-R1.
- Resolucion de problemas matematicos paso a paso, capacidad documentada en el modelo destilado original de DeepSeek.
- Generacion y comprension de codigo, tambien recogida en las capacidades declaradas del modelo destilado upstream.
- Respuestas sin rechazo ante peticiones que el modelo alineado bloquearia, gracias al proceso de abliteration.
- El autor documenta que, si el modelo omite el tag `<think>` o intenta negarse ante un prompt ambiguo, se puede forzar la cadena de razonamiento pre-rellenando la respuesta del asistente con la etiqueta abierta.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado como capacidad de agente con herramientas; la cadena de razonamiento interna es, por naturaleza, multi-paso.
- Capacidades de vision, audio o multimodalidad: no disponibles.
- Capacidades multilingues: no especificadas en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de IA y red teaming: el modelo permite estudiar como se comporta un LLM de 32B cuando se eliminan sus direcciones de rechazo, comparando respuestas con la version alineada para mapear el efecto real de la abliteration.
- Razonamiento matematico asistido en local: con Q4_K_M o Q5_K_M se puede ejecutar en una estacion de trabajo y resolver problemas que requieren cadena de pensamiento larga sin enviar datos a servicios en la nube.
- Generacion de codigo en entornos air-gapped: al disponer de GGUF para llama.cpp o Ollama y licencia Apache 2.0, puede integrarse en pipelines internos donde no se permite salida a internet.
- Escritura creativa y narrativa sin restricciones tematicas: la variante abliterada responde a peticiones sobre violencia, temas sensibles o ficcion adulta que el modelo alineado tiende a rechazar, lo que resulta util en edicion literaria.
- Analisis de documentacion tecnica extensa en local: el modelo denso de 32B ofrece mejor coherencia que alternativas de 7B-13B para resumir y extraer informacion de manuales, siempre que el contexto configurado en llama.cpp sea suficiente.
- Evaluacion comparativa de cuantizaciones: el repositorio es un banco de pruebas ideal para medir cuanto degrada cada nivel (de Q8_0 a Q2_K) la calidad del razonamiento, algo util para equipos que necesitan decidir su formato de despliegue.
- Destilacion o fine-tuning posterior: la licencia Apache 2.0 permite usar los pesos como base para derivados comerciales, siempre que se cumplan las condiciones de atribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante concreta. La documentacion oficial de DeepSeek si senala, de forma cualitativa, que el DeepSeek-R1-Distill-Qwen-32B supera a OpenAI-o1-mini en varios benchmarks y establece un nuevo estado del arte entre modelos densos de tamano comparable, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K, etc.) en el material proporcionado, ni resultados especificos tras el proceso de abliteration. No se deben extrapolar los numeros del modelo original a esta version: la abliteration y la cuantizacion pueden alterar el rendimiento de forma no medida.

## Requisitos de hardware

Los tamanos de archivo indicados por el autor permiten estimar la VRAM/RAM necesaria. Las cifras de la columna de recursos son estimaciones que anaden margen para la cache KV y el overhead del runtime; deben verificarse en el hardware concreto.

| Cuantizacion | Tamano en disco (aprox.) | VRAM/RAM estimada | Hardware de ejemplo |
|---|---|---|---|
| F16 | 65,6 GB | 70 GB o mas | 1x H100 80 GB o 2x A100 40 GB |
| Q8_0 | 34,8 GB | 38-40 GB | 1x A100 40 GB o 1x H100 |
| Q6_K | 27,2 GB | 30-32 GB | 1x A100 40 GB o 2x RTX 3090 |
| Q5_K_M | 23,4 GB | 26-28 GB | 2x RTX 3090/4090 o 1 GPU de 32 GB |
| Q5_K_S | 22,8 GB | 25-27 GB | igual que Q5_K_M |
| Q4_K_M | 19,9 GB | 22-24 GB | 1x RTX 4090 24 GB o RTX 3090 24 GB |
| Q4_K_S | 18,8 GB | 21-23 GB | 1x RTX 4090 o 3090 |
| Q3_K_L | 16,5 GB | 19-21 GB | 1x RTX 4090 o descarga parcial a RAM |
| Q3_K_M | 15,1 GB | 17-19 GB | RTX 4080 16 GB con offload parcial |
| Q3_K_S | 14,2 GB | 16-18 GB | RTX 4080 16 GB o 4060 Ti 16 GB |
| Q2_K | 12,1 GB | 14-16 GB | GPU de 12-16 GB o CPU + RAM |

- Cabe en GPU de consumo: si, en Q4_K_M o inferior para GPUs de 24 GB (RTX 3090, 4090); Q3 y Q2 caben en tarjetas de 16 GB e incluso en configuraciones mixtas CPU+GPU.
- La opcion Q4_K_M es el punto de entrada mas habitual para setups hogarenos avanzados, segun el propio autor.
- Opciones de despliegue: llama.cpp (incluye `llama-cli` y `llama-server`), Ollama, LM Studio y Text-Generation-WebUI. No se menciona soporte oficial para vLLM o TGI en GGUF en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen fuertemente del grado de offload a CPU, del ancho de banda de memoria y del backend (CUDA, Metal, ROCm) empleado.
- Nota del autor: Q2_K puede presentar problemas menores en la estructura de las etiquetas de pensamiento internas; se recomienda solo para desarrollo experimental.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizaciones disponibles | Filtros de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Thaurock/DeepSeek-R1-Distill-Qwen-32B-abliterated-GGUF (este) | 32,8B | GGUF | 11 (F16 a Q2_K) | Eliminados (abliterated) | Apache 2.0 | Hugging Face |
| huihui-ai/DeepSeek-R1-Distill-Qwen-32B-abliterated | 32,8B | safetensors | no aplica | Eliminados (abliterated) | no disponible en la informacion proporcionada | Hugging Face |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-32B | 32,8B | safetensors | no aplica | Alineado estandar | no disponible en la informacion proporcionada | Hugging Face, ModelScope |
| DeepSeek-R1-Distill-Llama-70B | 70B | safetensors y GGUF derivados | variable segun terceros | Alineado estandar | no disponible en la informacion proporcionada | Hugging Face |

Comparativamente, este repositorio solo se distingue por dos ejes: el proceso de abliteration y la cobertura completa de cuantizaciones GGUF en un unico lugar. Frente al safetensors de huihui-ai, aporta compatibilidad directa con runtimes de inferencia local y sin necesidad de conversion. Frente al modelo oficial de DeepSeek, sacrifica el alineamiento de seguridad a cambio de respuestas sin rechazo, un intercambio que no ha sido cuantificado en benchmarks publicos.

## Limitaciones y advertencias

- Ausencia total de filtros de seguridad: la abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido danino, ilegal o sensible sin advertencia. El autor declara explicitamente que el contenido generado es responsabilidad exclusiva de quien ejecuta la inferencia.
- Riesgo de alucinacion: como cualquier LLM de 32B, puede inventar datos, citas o referencias con aparente seguridad, especialmente en dominios especializados.
- Degradacion por cuantizacion: por debajo de Q4_K_M la calidad del razonamiento y del formato de las etiquetas `<think>` puede resentirse. Q2_K esta marcado por el autor como problematico para la estructura de las etiquetas de pensamiento.
- Sin datos de rendimiento propios: no hay benchmarks publicados para la variante abliterada, por lo que no se puede afirmar que conserve las capacidades del modelo original en matematicas, codigo o razonamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada en el repositorio; debe configurarse manualmente en el runtime y validarse con pruebas propias.
- Idioma: no se declaran idiomas soportados. Aunque la familia Qwen suele tener cobertura multilingue amplia, no hay confirmacion en la informacion proporcionada sobre como afecta la abliteration a idiomas distintos del ingles.
- Licencia: Apache 2.0 permite uso comercial y derivados, pero se debe verificar la cadena de licencias del modelo base destilado (DeepSeek/Qwen) antes de explotarlo en produccion.
- Tool calling y uso como agente: no confirmado; no conviene disenar pipelines de agentes que dependan de function calling sin validarlo primero.
- Idoneidad en produccion: la combinacion de ausencia de filtros, falta de evaluacion cuantitativa y posible degradacion por cuantizacion hace recomendable limitar su uso a entornos controlados, investigacion o experimentacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thaurock/DeepSeek-R1-Distill-Qwen-32B-abliterated-GGUF
- Modelo base abliterado (huihui-ai): https://huggingface.co/huihui-ai/DeepSeek-R1-Distill-Qwen-32B-abliterated
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Ficha en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B/summary
- Documentacion sobre modelos destilados (DeepWiki): https://deepwiki.com/deepseek-ai/DeepSeek-R1/2.3-distilled-models
- Perfil del autor del repositorio: https://huggingface.co/Thaurock
