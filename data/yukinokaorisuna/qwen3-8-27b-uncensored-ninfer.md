# YukinoKaorisuna/Qwen3.8-27B-Uncensored-ninfer

## Resumen

Qwen3.8-27B-Uncensored-ninfer es una conversión comunitaria del modelo Qwen3.8-27B de Alibaba Tongyi Qianwen, en su variante abliterated (dirección de rechazo eliminada de los pesos), empaquetada exclusivamente en el formato `.ninfer` del motor de inferencia NInfer. El autor de la ficha en HuggingFace es YukinoKaorisuna y el modelo base abliterated procede de `vkshdev/Qwen-3.8-28B-uncensored` (abliteration ZeroFuse). No es un checkpoint genérico de safetensors: no puede cargarse con `transformers` ni con llama.cpp, y requiere el motor NInfer.

El modelo base es un transformer denso de 27.000 millones de parámetros con atención híbrida (atención lineal Gated DeltaNet combinada con atención completa), modalidad nativa de visión-lenguaje, capacidades de razonamiento y tool calling, y una cabeza MTP (multi-token prediction) para decodificación especulativa. La conversión aquí publicada usa la receta de cuantización `groupwise-int-5080` (mezcla Q3/Q4/Q5) con un peso final de 15,33 GB, pensada para tarjetas de 16 GB de VRAM como la RTX 5070 Ti o la RTX 5080.

Su relevancia es de nicho: permite ejecutar localmente un modelo de 27B con visión y contexto largo en hardware de consumo de gama alta bajo Windows, a cambio de aceptar un ecosistema cerrado (motor NInfer) y una pérdida medida de capacidades en problemas de competición. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida: atención lineal Gated DeltaNet + atención completa; cabeza MTP de decodificación especulativa; proyector de visión (modalidad visión-lenguaje nativa) |
| Parametros totales | 27B (modelo base Qwen3.8-27B); los pesos abliterated de origen se etiquetan como 28B en `vkshdev/Qwen-3.8-28B-uncensored` |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 65.536 tokens en el ejemplo de uso del autor (`--max-context 65536`, solo texto); 8.192 tokens con visión activada en GPU de 16 GB. Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | Receta `groupwise-int-5080`: mezcla de Q3/Q4/Q5, archivo de 15,33 GB. KV cache en `q4` |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (formato nativo del motor NInfer), más `qwen3_8_27b_uncensored.ninfer.conversion.json` con metadatos de conversión. No incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina capas de atención lineal Gated DeltaNet con capas de atención completa, un esquema híbrido que reduce el coste de memoria y cómputo a contextos largos respecto a un transformer de atención completa pura. Incorpora además una cabeza MTP que permite decodificación especulativa con un modelo borrador (`z-lab/Qwen3.8-27B-DFlash2`), y un proyector de visión que habilita la entrada de imágenes. El resultado es un modelo denso de 27B, multimodal y con capacidad de razonamiento y llamada a herramientas.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La variante publicada aquí no es un reentrenamiento: la abliteration actúa ortogonalizando la dirección de rechazo en los pesos del modelo base, sin modificar la arquitectura. Sobre esa variante se aplica la cuantización `groupwise-int-5080` (Q3/Q4/Q5 mixto) y la conversión al formato `.ninfer`, con soporte de KV cache cuantizada a q4 y decodificación especulativa MTP con 3 tokens de borrador.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base Qwen3.8-27B.
- Razonamiento matemático y lógico, incluidos problemas de nivel de competición (con una pérdida medida respecto al modelo alineado, ver sección de benchmarks).
- Generación de código, según las capacidades declaradas del modelo base.
- Tool calling y function calling: el material de referencia describe el modelo base como capacitado para tool-calling.
- Comprensión de imágenes mediante el flag `--vision` del motor NInfer, con el proyector de visión empaquetado en el propio archivo de pesos.
- Decodificación especulativa MTP con 3 tokens de borrador (`--spec mtp --draft-tokens 3`).
- Soporte multilingüe limitado a chino e inglés según los metadatos del repositorio.
- Modo sin rechazos (abliterated): responde a peticiones que el modelo alineado rechazaría. No implica capacidades adicionales de razonamiento ni de conocimiento.

## Casos de uso

- Asistente local de escritorio en Windows sobre una RTX 5070 Ti o 5080 de 16 GB: con `--max-context 65536` y KV en q4, el modelo cabe íntegro en VRAM y permite conversaciones multi-turno de contexto largo sin depender de la nube.
- Análisis de documentos largos en chino o inglés: la ventana de hasta 65.536 tokens permite procesar informes, contratos o expedientes completos en una sola pasada, con prefill medido en torno a 1.300 tokens/s en la RTX 5070 Ti.
- Etiquetado y resumen de imágenes: con `--vision` y contexto reducido a 8.192 tokens, se puede usar como extractor de descripciones o clasificador de imágenes dentro de un pipeline local, asumiendo el límite de contexto que impone la VRAM.
- Investigación sobre alineación y abliteration: el modelo permite estudiar empíricamente qué capacidades se degradan al eliminar la dirección de rechazo, comparando contra el modelo base alineado.
- Escritura creativa sin filtros de contenido: el propósito declarado del build es la creación personal y la investigación; resulta adecuado para generar narrativa o material de ficción que el modelo alineado rechazaría.
- Prototipado de agentes con tool calling en local: el soporte de function calling y la decodificación especulativa MTP (aceptación esperada del 44,7 % en RTX 5080) permiten bucles de agente con latencia interactiva sin salir del equipo.
- Servicio HTTP local de bajo nivel: el comando `ninfer-serve.exe` expone una API en `127.0.0.1:8100` con `--model-id`, lo que permite integrarlo en aplicaciones propias que consuman un endpoint compatible.
- Pruebas de estrés de memoria y cuantización: la combinación Q3/Q4/Q5 con KV q4 sirve como caso de referencia para evaluar recetas de cuantización en GPUs de 16 GB.

## Benchmarks y rendimiento

El autor publica un test interno rápido (no oficial) de 48 preguntas objetivas con `temperature=0`, comparando el modelo oficial con el abliterated:

| Bloque | Oficial | Abliterated |
|---|---|---|
| Básico (12 preguntas) | 12 | 12 |
| Medio (12 preguntas) | 12 | 12 |
| Competición (12 preguntas) | 10 | 9 |
| Olimpiada (12 preguntas) | 9 | 8 |
| **Total (48)** | **43** | **41** |

Diferencias declaradas por el autor: cero variación en las 24 preguntas de tareas cotidianas (matemáticas, sentido común, código, lógica); dos puntos menos (aproximadamente un 4 %) en problemas de competición, concentrados en lógica autorreferencial (paradoja del mentiroso) y evaluación de funciones recursivas.

Rendimiento de inferencia medido por el autor:

| Configuración | prefill | decode |
|---|---|---|
| RTX 5070 Ti, 8192 ctx + MTP-3 + CUDA graph | ~1300 tok/s | ~65 tok/s |
| RTX 5070 Ti, 8192 ctx + visión + MTP-3 | ~1600 tok/s | ~68-70 tok/s |
| RTX 5070 Ti, 65536 ctx, solo texto | no disponible | ~41 tok/s |
| RTX 5080 (valores esperados por el autor) | ~1378 tok/s | ~71 tok/s; aceptación MTP ~44,7 % |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM: el archivo de pesos ocupa 15,33 GB, por lo que el modelo está calibrado para GPUs de 16 GB (RTX 5070 Ti, RTX 5080). Con visión activada, el contexto máximo viable en 16 GB es 8.192 tokens; 16.384 tokens excede el presupuesto en 85 MB.
- GPUs validadas: RTX 5070 Ti (16 GB, 70 SM, 896 GB/s), con mediciones reales. RTX 5080 (16 GB, 84 SM, 960 GB/s), con valores esperados derivados de su mayor ancho de banda y número de SM.
- GPUs no validadas: no hay datos publicados para A100, H100, RTX 4090 u otras. Al tratarse de un formato específico del motor NInfer, la compatibilidad fuera del ecosistema CUDA de consumo descrito no está garantizada.
- Capacidad en GPU de consumo: sí, en tarjetas de 16 GB de la generación descrita (serie RTX 50). El autor cita expresamente RTX 5070 Ti y RTX 5080.
- Opciones de despliegue: exclusivamente el motor NInfer (`ninfer-serve.exe`), con build para Windows en el repositorio `YukinoKaorisuna/ninfer-5070ti`. No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato. Para esos motores existen conversiones alternativas del mismo modelo abliterated (véase la comparativa).
- Latencia y throughput: decode de ~65 tok/s (5070 Ti, 8192 ctx) y ~41 tok/s a 65.536 tokens de contexto; prefill de ~1300-1600 tok/s. Se recomienda `--kv-dtype q4` para ajustar la memoria de la caché KV.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YukinoKaorisuna/Qwen3.8-27B-Uncensored-ninfer | 27B denso | hasta 65.536 (texto); 8.192 con visión en 16 GB | `.ninfer` (solo motor NInfer) | Apache 2.0 | 0 descargas, 0 likes; build Windows en `ninfer-5070ti` |
| orcarouter/Qwen3.8-27B-Uncensored (Ollama) | 27B denso | no disponible | GGUF (16 tags de 2 a 8 bits, cada uno con `mmproj` de visión) | no disponible en la información recogida | Publicado en el registro de Ollama; compatible con llama.cpp/Ollama |
| junafinity/Qwen-3.8-27B-Uncensored | 27B denso (presunto, no confirmado) | no disponible | no disponible | no disponible | Repositorio en HuggingFace; sin datos de descargas recogidos |
| Qwen/Qwen3.8-27B (base alineado) | 27B denso | no disponible | no disponible | no disponible | Referenciado como modelo base por el autor |

La comparación de rendimiento entre estas variantes no es posible con la información disponible: solo la ficha de YukinoKaorisuna publica cifras, y son de un test interno no estandarizado. La diferencia funcional principal es el formato: las builds GGUF de Ollama son portables entre motores, mientras que `.ninfer` queda atado al motor NInfer.

## Limitaciones y advertencias

- Dependencia de motor: el archivo `.ninfer` no se carga con `transformers`, llama.cpp, vLLM, Ollama ni TGI. Sin el motor NInfer y su build para Windows, el modelo es inservible.
- Formato propietario y ecosistema reducido: no hay pesos en safetensors ni GGUF en este repositorio, lo que limita la portabilidad y la integración en pipelines existentes.
- Pérdida de capacidad por abliteration: en el test interno del autor, 2 puntos menos sobre 48 (aproximadamente 4 %) en problemas de competición, con fallos concentrados en lógica autorreferencial y funciones recursivas. Al no ser un benchmark estandarizado, la magnitud real de la degradación es incierta.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni tasas de alucinación para este build. La abliteration no corrige ni agrava documentadamente este aspecto, pero tampoco hay evidencia en sentido contrario.
- Idiomas: solo chino e inglés declarados. El rendimiento en castellano no está documentado y no debería asumirse.
- Límite de contexto con visión: en GPUs de 16 GB el contexto baja a 8.192 tokens, lo que restringe el análisis de imágenes acompañadas de texto extenso. Con 16.384 tokens el modelo excede el presupuesto de VRAM en 85 MB.
- Contenido sin filtros: el propósito declarado es investigación y creación personal. El autor pide explícitamente respetar la legislación local y no generar contenido ilegal o dañino. El uso en producción orientada al usuario final implica riesgos de seguridad y de cumplimiento normativo que no cubre la licencia.
- Licencia: Apache 2.0 permite uso comercial según los términos de la licencia, pero la model card restringe el uso a investigación y creación personal, lo que genera una ambigüedad que conviene resolver con el autor antes de un despliegue comercial.
- Adopción nula y trazabilidad limitada: 0 descargas y 0 likes, creado y actualizado el mismo día. No hay historial de versiones, evaluación independiente ni garantía de mantenimiento del repositorio.
- Ambigüedad de nomenclatura: el repositorio de pesos abliterated de origen se denomina "28B" mientras el modelo base es "27B". Esta discrepancia no está aclarada en la documentación disponible.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/YukinoKaorisuna/Qwen3.8-27B-Uncensored-ninfer
- Perfil del autor: https://huggingface.co/YukinoKaorisuna
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos abliterated de origen (ZeroFuse): https://huggingface.co/vkshdev/Qwen-3.8-28B-uncensored
- Motor NInfer: https://github.com/Neroued/ninfer
- Receta de cuantización y port a Windows: https://github.com/toddballinger/ninfer-5080
- Pull request del port a Windows: https://github.com/toddballinger/ninfer-5080/pull/16
- Repositorio de producción del autor (build Windows + port 5070 Ti): https://github.com/YukinoKaorisuna/ninfer-5070ti
- Modelo borrador DFlash2 para decodificación especulativa: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Build en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Guía de ejecución local con GGUF y llama.cpp: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Conversión alternativa en HuggingFace: https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored
- Repositorio comunitario de ejecución local: https://github.com/Wassimyounes01/qwen38-uncensored
