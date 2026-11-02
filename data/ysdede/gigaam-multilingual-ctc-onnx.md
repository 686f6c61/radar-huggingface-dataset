# ysdede/gigaam-multilingual-ctc-onnx

## Resumen

gigaam-multilingual-ctc-onnx es una exportación a formato ONNX del modelo GigaAM en su checkpoint `multilingual_ctc`, publicada por el usuario ysdede para su uso en ASRJS (un motor de reconocimiento de voz ejecutable en navegador). El modelo original procede del repositorio de Sber (salute-developers/GigaAM), un sistema de reconocimiento automático del habla (ASR) orientado principalmente al ruso y a escenarios multilingües. Esta publicación no entrena un modelo nuevo: se limita a empaquetar el grafo FP32 ya exportado localmente, junto con un recibo de procedencia y la licencia MIT.

La relevancia de esta ficha es acotada y conviene subrayarla: se trata de un artefacto de despliegue (inferencia ONNX) más que de un modelo con documentación técnica propia. El autor indica explícitamente que la publicación por sí sola no acredita ninguna métrica de precisión ni paridad de comportamiento entre navegador y entorno de referencia. El repositorio ocupa 0,9 GB, lo que es coherente con un grafo FP32 de un modelo ASR de tamaño medio, pero no se dispone de datos sobre número de parámetros, arquitectura interna ni composición del corpus de entrenamiento.

Por tanto, esta ficha describe lo que se puede afirmar con la información disponible (formato, licencia, origen, propósito) y marca como "no disponible" todo aquello que la model card no documenta: parámetros, contexto, idiomas exactos, cuantizaciones y benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR original GigaAM; topología interna no documentada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el artefacto publicado son grafos FP32) |
| Idiomas soportados | no disponible (el checkpoint se denomina `multilingual_ctc`, sin listado de idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (grafos FP32) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original en la documentación proporcionada. El checkpoint de origen se identifica como `multilingual_ctc` (MD5 5379d887c53ccd9cb95981e2a1832720), lo que sugiere una cabeza CTC (Connectionist Temporal Classification) sobre un encoder acústico, un esquema habitual en ASR. El modelo base procede del proyecto GigaAM de salute-developers, pero la model card de esta exportación no detalla capas, atención, tamaño de ventana ni estrategia de tokenización.

Respecto al entrenamiento, la información disponible no incluye número de tokens, composición del dataset, ni si hubo ajuste por RLHF/DPO (poco habitual en ASR). Lo único verificable es el proceso de exportación: se preservan los grafos FP32 del export local registrado y se adjunta un recibo de procedencia. El autor declara explícitamente que no se emite ninguna afirmación de precisión ni de paridad entre navegador y entorno de referencia por el mero hecho de publicar el artefacto.

## Capacidades

- Reconocimiento automático del habla (ASR): el pipeline declarado es `automatic-speech-recognition`.
- Decodificación CTC: el nombre del checkpoint indica una cabeza CTC, adecuada para transcripción alineada sin modelo de lenguaje externo obligatorio.
- Orientación multilingüe: el identificador `multilingual` sugiere soporte de más de un idioma, aunque no se enumeran los idiomas concretos.
- Ejecución en navegador vía ONNX Runtime Web: el formato ONNX y el propósito declarado (ASRJS) apuntan a inferencia en cliente.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de voz en el navegador: al ser un grafo ONNX, puede cargarse con ONNX Runtime Web y ejecutar ASR en el cliente sin enviar audio a un servidor, lo que reduce latencia de red y mejora la privacidad.
- Subtitulado de reuniones o clases en tiempo (casi) real: un modelo CTC permite transcripciones alineadas temporalmente, útiles para generar subtítulos sincronizados.
- Dictado en aplicaciones web: integración en editores o formularios para convertir voz en texto sin depender de una API externa.
- Procesamiento por lotes de audio pregrabado: al ser un artefacto ONNX portable, puede ejecutarse en servidores ligeros o en el edge con ONNX Runtime.
- Prototipado de pipelines ASR multilingües: sirve como base para evaluar el comportamiento del checkpoint `multilingual_ctc` antes de comprometerse con un despliegue mayor.
- Investigación en eficiencia de inferencia: permite medir rendimiento de un modelo ASR en entornos con recursos limitados (navegador, dispositivos de gama baja) sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que la publicación no acredita precisión ni paridad de comportamiento entre navegador y entorno de referencia.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,9 GB en FP32, por lo que la huella en memoria rondará ese orden de magnitud, pero no se documenta.
- GPU recomendadas: no disponible; al ser un artefacto ONNX orientado a navegador, el objetivo declarado es ejecución en CPU/WASM.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecución en CPU, y potencialmente en GPU vía WebGPU/WebGL, pero no se aportan datos.
- Opciones de despliegue: ONNX Runtime (incluida la variante Web), y potencialmente otros runtimes compatibles con ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gigaam-multilingual-ctc-onnx | ASR (ONNX) | no disponible | no disponible | MIT | HuggingFace |
| Whisper (variantes) | ASR | no disponible en esta ficha | no disponible | MIT (variantes abiertas) | HuggingFace |
| wav2vec 2.0 | ASR | no disponible en esta ficha | no disponible | MIT/Apache según variante | HuggingFace |

No se dispone de datos de rendimiento del modelo publicado que permitan una comparación cuantitativa con alternativas. La comparativa anterior es meramente categórica (modelos ASR de código abierto) y no debe interpretarse como una evaluación de calidad.

## Limitaciones y advertencias

- Ausencia de métricas: no hay resultados de benchmarks ni validación de precisión publicados; no debe asumirse calidad sin evaluar.
- Idiomas no documentados: aunque el nombre indica multilingüe, no se enumeran los idiomas cubiertos ni su calidad relativa.
- Sin datos de sesgo: no se documentan sesgos conocidos del modelo original ni del corpus de entrenamiento.
- Riesgo de alucinación: en ASR, el riesgo se traduce en transcripciones incorrectas o palabras inventadas en audio ruidoso; no se aportan tasas de error.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar el recibo de procedencia y el LICENSE incluidos, así como la licencia del modelo GigaAM original.
- Artefacto de despliegue, no modelo documentado: la model card no describe arquitectura, parámetros ni entrenamiento; cualquier decisión de producción debe basarse en evaluación propia.
- Sin garantía de paridad: el autor advierte que la publicación no acredita paridad entre navegador y entorno de referencia.

## Enlaces

- HuggingFace: https://huggingface.co/ysdede/gigaam-multilingual-ctc-onnx
- Repositorio original GigaAM: https://github.com/salute-developers/GigaAM
