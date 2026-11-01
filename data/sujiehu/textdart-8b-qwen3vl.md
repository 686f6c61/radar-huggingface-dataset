# SujieHu/TextDART-8B-Qwen3VL

## Resumen

TextDART-8B-Qwen3VL es un modelo multimodal de tipo image-text-to-text desarrollado por SujieHu (con repositorio asociado en la organizacion WeChatCV) y afinado a partir de Qwen/Qwen3-VL-8B-Instruct. Su proposito no es la generacion de texto o codigo al uso, sino actuar como reward model consciente de defectos para la generacion de texto visual: localiza cada region de texto visible en una imagen, transcribe su contenido y marca de forma explicita los glifos malformados en lugar de corregirlos silenciosamente a partir del contexto.

El modelo resuelve un problema concreto en los pipelines de generacion de imagenes con texto renderizado (carteles, interfaces, documentos sinteticos): la evaluacion fiable de la fidelidad tipografica y semantica. Para ello devuelve, por cada region detectada, un cuadrilatero en coordenadas normalizadas sobre una rejilla de 0-1000 y la transcripcion reconocida, empleando marcadores estructurales de anomalia (`<#>`, `<###>`, `<#####>`) para senalar caracteres, palabras o bloques ilegibles.

Es relevante ahora porque se publica junto al articulo "Blame Errant Words, Not the Canvas: Defect-Aware Spatial Credit Assignment for Visual Text Generation" (arXiv:2610.20794), que propone asignar credito espacial a nivel de region en el aprendizaje por refuerzo de modelos de generacion de texto visual. Con 8.767.123.696 parametros, licencia Apache 2.0 y despliegue compatible con vLLM mediante API compatible con OpenAI, se posiciona como una pieza de infraestructura para evaluacion y RLHF mas que como un asistente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3-VL (image-text-to-text) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los marcadores de anomalia cubren caracteres chinos y letras/palabras en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3-VL-8B-Instruct, un transformer multimodal de 8.767 millones de parametros, y se presenta como un fine-tune del mismo. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO en su ajuste. Lo que si se explicita es su funcion: es un reward model "defect-aware" y "region-targeted", es decir, entrenado para emitir senales de recompensa a nivel de region de texto y no a nivel de imagen completa.

La innovacion tecnica destacable es la asignacion espacial de credito descrita en el articulo asociado: en lugar de penalizar globalmente una imagen generada por un texto mal renderizado, el modelo localiza la region concreta del fallo y la marca con glifos de anomalia estructurados. La salida se estructura como JSON con una lista de regiones, cada una con un cuadrilatero de ocho coordenadas normalizadas a una rejilla 0-1000 y el texto reconocido, lo que permite un parsing determinista y su integracion directa en bucles de refuerzo.

## Capacidades

- Deteccion y localizacion de regiones de texto visible en imagenes, con salida de cuadrilateros en coordenadas normalizadas 0-1000.
- Transcripcion (OCR) del contenido renderizado en cada region detectada.
- Identificacion explicita de glifos malformados mediante marcadores estructurales: `<#>` para un caracter chino o letra inglesa malformado e ilegible, `<###>` para una palabra inglesa malformada e ilegible y `<#####>` para un bloque completo de texto secundario o de letra pequena ilegible.
- Deteccion de distorsion, trazos faltantes o sobrantes, desenfoque y otras anomalias tipograficas.
- Generacion de senales de recompensa a nivel de region para aprendizaje por refuerzo de modelos de generacion de texto visual.
- Evaluacion de correccion semantica y fidelidad de glifos en imagenes generadas.
- Salida en JSON estructurado, apta para parsing automatico.
- Despliegue servido mediante vLLM con API compatible con OpenAI (tag `endpoints_compatible`).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio ni modo thinking.

## Casos de uso

- Evaluacion de modelos de generacion de imagenes con texto: el modelo actua como juez por region, devolviendo cuadrilateros y transcripciones que permiten medir fidelidad tipografica y semantica alli donde aparece texto, en lugar de una unica puntuacion global de imagen.
- Entrenamiento por refuerzo de generadores de texto visual: integrado en el pipeline SCANNER como reward model, proporciona recompensas espacialmente localizadas que penalizan solo la region defectuosa y no el lienzo completo, tal como describe el articulo asociado.
- Control de calidad en pipelines de datos sinteticos: al procesar lotes de imagenes generadas para aumentar datasets, el modelo detecta glifos corruptos y permite descartar o regenerar unicamente las regiones afectadas.
- Auditoria de carteles, interfaces y mockups generados: la salida JSON con coordenadas normalizadas facilita superponer anotaciones y revisar visualmente cada bloque de texto antes de publicar un activo grafico.
- Verificacion de documentos escaneados o renderizados: la deteccion de bloques de letra pequena ilegible (`<#####>`) sirve para senalar areas que requieren reescaneo o mayor resolucion.
- Investigacion en evaluacion multimodal: como reward model open source con licencia Apache 2.0, permite reproducir y extender experimentos de asignacion de credito espacial sin depender de APIs propietarias.
- Servicio interno de OCR con marcado de errores: desplegado con vLLM y API compatible con OpenAI, puede exponerse a herramientas internas que necesiten transcripcion con indicacion explicita de incertidumbre en lugar de correccion silenciosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Con 8.767 millones de parametros, la huella en precision completa (fp16/bf16) se situa en torno a 17,5 GB de pesos, coherente con el tamano del repositorio (17,5 GB); a ello hay que sumar el coste del procesador visual y de la cache KV, cuyo valor concreto no se documenta.
- GPU recomendadas: no se especifican modelos concretos. El script de despliegue oficial (`deploy_server.sh`) indica que cada GPU listada aloja una replica completa del modelo, lo que sugiere GPUs de clase datacenter con memoria suficiente para los pesos completos.
- Cabe en GPU de consumo: no disponible. No se documentan variantes cuantizadas ni despliegue en llama.cpp u Ollama.
- Opciones de despliegue: vLLM mediante el script oficial `deploy_server.sh` con API compatible con OpenAI; inferencia de demostracion con `infer_demo.py` apuntando a la URL del servidor; uso directo con la libreria transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TextDART-8B-Qwen3VL | 8.767 M | no disponible | Reward model de texto visual con localizacion de regiones y marcado de defectos | Apache 2.0 | HuggingFace, repo GitHub |
| Qwen/Qwen3-VL-8B-Instruct | no disponible en la informacion | no disponible | Modelo multimodal instructivo generalista (backbone del anterior) | no disponible en la informacion | HuggingFace |
| Otros reward models de generacion de texto visual | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo base, del que TextDART hereda arquitectura y tamano pero del que se diferencia por el ajuste especifico para localizacion de regiones, transcripcion con marcado de defectos y emision de recompensas espaciales. No se dispone de datos de benchmarks ni de especificaciones de terceros alternativos para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta especializado en evaluacion de texto visual; no debe emplearse como asistente generalista, generador de codigo ni modelo conversacional.
- Los marcadores de anomalia estan definidos para caracteres chinos, letras y palabras en ingles y bloques de texto pequeno; el comportamiento con otros sistemas de escritura no esta documentado.
- El modelo prioriza marcar glifos malformados frente a corregirlos por contexto, lo que puede producir transcripciones con marcadores donde un OCR convencional devolveria texto plausible; los consumidores del JSON deben manejar esos marcadores explicitamente.
- Riesgo de alucinacion en la transcripcion de regiones de bajo contraste, desenfocadas o con tipografias no vistas durante el ajuste; la informacion disponible no cuantifica este riesgo.
- No se documentan sesgos conocidos, cobertura idiomatica ni evaluaciones de robustez fuera del dominio de generacion de texto visual.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3-VL-8B-Instruct y el usuario debe verificar las condiciones aplicables al modelo base.
- No se publican datos de contexto maximo, cuantizaciones soportadas ni latencias, lo que dificulta dimensionar despliegues en produccion sin pruebas propias.
- El modelo tiene un volumen de descargas muy bajo (29) y ninguna valoracion en el momento de la consulta; se recomienda validacion interna antes de adoptarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SujieHu/TextDART-8B-Qwen3VL
- Pagina del proyecto: https://sujiehu.github.io/textdart-scanner/
- Articulo: https://arxiv.org/abs/2610.20794
- Repositorio principal (SCANNER): https://github.com/WeChatCV/TextDART-SCANNER
- Guia de despliegue de TextDART: https://github.com/WeChatCV/TextDART-SCANNER/tree/main/TextDART/train
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
