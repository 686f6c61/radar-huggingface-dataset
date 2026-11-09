# zanezhang666/Ornith-1.5-9B-uncensored-GGUF

## Resumen

Ornith-1.5-9B-uncensored-GGUF es una version cuantizada en formato GGUF del modelo junafinity/Ornith-1.5-9B-uncensored, un modelo de lenguaje multimodal de aproximadamente 8.950 millones de parametros (8.953.803.264 segun los pesos en safetensors). La familia Ornith se asocia en las etiquetas del repositorio con la arquitectura qwen3_5, lo que sugiere una base derivada de Qwen3.5, si bien la model card no documenta explicitamente la arquitectura subyacente. El modelo se presenta como "abliterated" y "uncensored", terminos que indican que se ha aplicado una tecnica de ablacion de direcciones de rechazo para reducir el comportamiento de rechazo del modelo original, y que ademas incorpora capacidades de vision (multimodal).

El repositorio aqui descrito lo publica zanezhang666 y contiene las cuantizaciones estaticas generadas por mradermacher a partir del modelo base. La relevancia de esta ficha radica en que ofrece un punto de entrada en formato GGUF para ejecutar localmente un modelo de ~9B con vision y con un comportamiento menos restrictivo, algo util para experimentacion e investigacion sobre alineacion y seguridad. El modelo esta etiquetado unicamente para ingles y distribuido bajo licencia Apache 2.0.

No se dispone de informacion publica sobre volumen de entrenamiento, composicion del dataset ni proceso de alineacion (RLHF/DPO) del modelo original, por lo que los apartados correspondientes se marcan como no disponibles cuando no hay dato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas del repo apuntan a qwen3_5; transformer multimodal con vision) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 para vision |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a qwen3_5 y a un modelo multimodal con vision. El modelo base (junafinity/Ornith-1.5-9B-uncensored) es de tipo "abliterated/uncensored", lo que implica que se ha modificado el comportamiento de rechazo del modelo original mediante tecnicas de ablacion de direcciones en el espacio de activaciones; no se documenta el procedimiento exacto, ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplico RLHF o DPO.

En cuanto a innovaciones tecnicas, la model card del repositorio cuantizado no aporta detalles sobre decodificacion especulativa, atencion lineal ni otras optimizaciones. Los unicos datos tecnicos concretos son los tamanos de las cuantizaciones (desde 3,9 GB para Q2_K hasta 18,0 GB para f16) y la existencia de un modulo mmproj para el procesamiento multimodal, lo que confirma la integracion de vision dentro del pipeline GGUF.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline etiquetado como "conversational").
- Capacidades multimodales con vision: el repositorio incluye archivos mmproj (Q8_0 y f16) necesarios para procesar imagenes junto al texto.
- Comportamiento "uncensored": el modelo ha sido modificado para reducir rechazos, orientado a experimentacion e investigacion.
- Razonamiento y codigo: no se documentan explicitamente en la model card; no disponible como capacidad confirmada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentacion sobre alineacion y seguridad: el caracter abliterated permite estudiar como cambia el comportamiento del modelo al eliminar direcciones de rechazo, comparando respuestas con el modelo original no modificado.
- Ejecucion local en hardware de consumo: las cuantizaciones Q4_K_M (5,7 GB) y Q5_K_M (6,6 GB) permiten desplegar el modelo en GPUs de gama alta para consumidor y en equipos con 8-16 GB de VRAM.
- Analisis de imagenes en local: gracias al modulo mmproj, el modelo puede procesar imagenes junto a texto en pipelines GGUF, util para prototipos de vision por computador sin depender de servicios en la nube.
- Investigacion de sesgos y contenido: al ser un modelo sin filtros de rechazo, sirve para auditar como los modelos base gestionan peticiones sensibles y para construir conjuntos de evaluacion de seguridad.
- Prototipos de asistentes conversacionales en ingles: con contexto conversacional y cuantizaciones ligeras, es adecuado para demos de chatbot en entornos controlados.
- Pruebas de integracion con llama.cpp y servidores GGUF: el formato y los tamanos conocidos facilitan la validacion de pipelines de inferencia (llama.cpp, Ollama, servidores compatibles con endpoints) antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~3,9 GB; Q3_K_S ~4,4 GB; Q3_K_M ~4,7 GB; Q3_K_L ~5,0 GB; IQ4_XS ~5,3 GB; Q4_K_S ~5,5 GB; Q4_K_M ~5,7 GB; Q5_K_S ~6,4 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18,0 GB.
- Vision: sumar ~0,7 GB (mmproj-Q8_0) o ~1,0 GB (mmproj-f16) al presupuesto de VRAM/memoria.
- GPU recomendadas: para Q4_K_M y Q5_K_M bastan GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090); para Q8_0 se recomienda 12-16 GB (RTX 4080/4090, A100 40 GB sobrada); para f16 se requiere entorno de 24 GB o mas (RTX 3090/4090 24 GB, A100, H100).
- Cabe en GPU de consumo: si, en cuantizaciones Q4_K_M o inferiores con GPUs de 8 GB o mas; las cuantizaciones Q6_K en adelante requieren 12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y servidores GGUF compatibles con endpoints; el repositorio esta etiquetado como "endpoints_compatible". El modelo base en safetensors puede servirse con transformers, vLLM o TGI (no verificado para este modelo concreto).
- Latencia y throughput: no disponibles; dependen de la GPU, del backend y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-uncensored (este) | ~8,95B | no disponible | Apache 2.0 | GGUF / safetensors | Multimodal con vision, abliterated, solo ingles |
| Qwen3.5 (familia base sugerida) | no disponible | no disponible | no disponible | safetensors | Modelo original de referencia segun etiquetas |
| Modelos abliterated de ~8-9B en GGUF | ~7-9B | no disponible | variable | GGUF | Alternativas genericas de la misma categoria; no se dispone de comparacion numerica |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": la ablacion de direcciones de rechazo puede degradar la coherencia en dominios sensibles y aumentar la probabilidad de respuestas inapropiadas; no es recomendable para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; al ser un modelo pequeno (~9B) y sin benchmarks publicados, la fiabilidad factual no esta garantizada.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre posibles sesgos heredados del modelo base.
- Vision: requiere cargar el archivo mmproj correspondiente; sin el, las capacidades multimodales no funcionan.
- Procedencia: el repositorio aqui descrito es una cuantizacion de terceros (mradermacher/zanezhang666) del modelo de junafinity; conviene verificar la integridad de los pesos antes de usarlos en produccion.
- Datos tecnicos incompletos: arquitectura exacta, contexto, datos de entrenamiento y benchmarks no estan documentados en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zanezhang666/Ornith-1.5-9B-uncensored-GGUF
- Modelo base: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-i1-GGUF
- Pagina de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
