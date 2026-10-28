# soyrsoyr/DeepSeek-V3-NVFP4-FP8-Dynamic-MTP

## Resumen

Este repositorio contiene una version cuantizada del modelo DeepSeek-V3, un transformer de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek. El artefacto lo publica el usuario de la comunidad `soyrsoyr` y parte del checkpoint `RedHatAI/DeepSeek-V3-BF16`, sobre el que se aplica una cuantizacion mixta NVFP4 (pesos a 4 bits en formato de coma flotante de NVIDIA) y FP8 dinamico (activaciones), generada con la libreria `llm-compressor` y almacenada con el formato `compressed-tensors`. El sufijo `MTP` indica que se conservan los modulos de Multi-Token Prediction del modelo base, pensados para decodificacion especulativa y mejora del throughput.

El interes practico de esta ficha radica en que permite desplegar un modelo de 671.000 millones de parametros totales (37.000 millones activos por token) en un footprint de memoria notablemente reducido frente a BF16, a costa de depender de hardware Blackwell para aprovechar de forma nativa el NVFP4. El repositorio es muy reciente (subido el 27 de octubre de 2026), no registra descargas ni interacciones, y no incluye model card con detalles de calibracion, evaluacion o licencia.

Conviene subrayar que esta es una publicacion de terceros, no oficial de DeepSeek ni de Red Hat, y que la informacion disponible en el repositorio es minima: no hay datos de benchmarks, ni especificacion de la receta de cuantizacion, ni aclaracion sobre licencia o idiomas. Las especificaciones del modelo base que se recogen a continuacion proceden de la identidad explicita del checkpoint de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (DeepSeekMoE) con Multi-head Latent Attention (MLA) y modulos MTP, heredada del modelo base DeepSeek-V3 |
| Parametros totales | 671.000 millones (671B), heredados del modelo base |
| Parametros activos | 37.000 millones (37B) por token |
| Longitud de contexto | 128K tokens (modelo base) |
| Tipos de cuantizacion | NVFP4 en pesos (4 bits) + FP8 dinamico en activaciones, via `llm-compressor` y `compressed-tensors` |
| Idiomas soportados | No disponible para este repositorio; el modelo base esta optimizado principalmente para ingles y chino |
| Licencia | No disponible en el repositorio; el modelo base DeepSeek-V3 se distribuye bajo la licencia de DeepSeek |
| Formato de pesos | Safetensors con `compressed-tensors`; requiere `trust_remote_code` (`custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de DeepSeek-V3: un transformer decoder-only con atencion multi-cabeza latente (MLA), que comprime las claves y valores en un espacio latente de baja dimension para reducir el coste de la cache KV, y una capa MoE con enrutamiento por token que activa 37B de los 671B parametros totales. Incluye ademas modulos de Multi-Token Prediction (MTP), que predicen varios tokens por paso y habilitan decodificacion especulativa para aumentar el throughput. El checkpoint de partida es la version BF16 distribuida por Red Hat AI.

Sobre el entrenamiento del modelo base: DeepSeek-V3 fue preentrenado con aproximadamente 14,8 billones de tokens e incluye fases de post-entrenamiento con aprendizaje por refuerzo y optimizacion de preferencias. No obstante, **la informacion proporcionada no detalla la receta de cuantizacion de este artefacto concreto**: se desconoce el conjunto de calibracion empleado para el NVFP4 y el FP8 dinamico, el esquema exacto de escalado por bloques, y si se aplicaron ajustes especificos para preservar los modulos MTP. Tampoco hay documentacion sobre posibles perdidas de calidad derivadas de la cuantizacion.

## Capacidades

- Generacion de texto conversacional y de formato largo, con soporte multi-turno.
- Razonamiento y resolucion de problemas matematicos, heredado del modelo base.
- Generacion y comprension de codigo en multiples lenguajes de programacion.
- Soporte de tool calling y function calling (capacidad del modelo base; no verificada en esta cuantizacion).
- Capacidades agenticas y de razonamiento multi-paso.
- Decodificacion especulativa mediante los modulos MTP conservados en el checkpoint.
- Multilingue con foco en ingles y chino; el rendimiento en otros idiomas no esta documentado para esta version.
- Modelo exclusivamente de texto: no incluye vision ni audio.

## Casos de uso

- **Asistente conversacional de gran contexto**: el modelo puede mantener dialogos multi-turno apoyandose en su ventana de 128K tokens, util para soporte tecnico o analisis de documentos extensos en una sola pasada.
- **Generacion de codigo en pipelines de CI/CD**: su soporte de tool calling permite integrarlo como agente que consulta APIs, ejecuta pruebas y propone parches dentro de flujos automatizados.
- **Razonamiento sobre repositorios completos**: con 128K de contexto puede ingerir varios ficheros y generar resumenes o revisiones cruzadas de codigo.
- **Automatizacion de tareas agenticas**: como planificador en sistemas multi-paso que requieren descomponer objetivos y llamar a herramientas externas.
- **Analisis de documentacion legal o financiera**: extraccion y sintesis de contratos o informes largos, aprovechando la ventana extendida.
- **Generacion aumentada por recuperacion (RAG) a gran escala**: combinado con un almacen vectorial para responder preguntas sobre corpus extensos, con la ventaja de que el modelo completo cabe en menos GPUs gracias al NVFP4.
- **Investigacion en cuantizacion**: sirve como referencia para estudiar el impacto del NVFP4 y el FP8 dinamico sobre un MoE de gran tamano, comparandolo con el checkpoint BF16 de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para pesos**: el NVFP4 a 4 bits situa los pesos en torno a 336-380 GB (estimacion a partir de los 671B parametros totales); a ello hay que sumar la cache KV, las activaciones en FP8 y los modulos MTP, por lo que el consumo real es superior.
- **Aceleracion nativa**: el NVFP4 esta soportado de forma nativa en GPUs Blackwell (B200/GB200, 192 GB por GPU). En Hopper (H100/H200) los pesos NVFP4 requieren descompresion a FP8/FP16, lo que reduce la ventaja de memoria y rendimiento.
- **Configuraciones recomendadas** (estimaciones): 4x B200 (768 GB) o 8x H200 (1,1 TB) para servir con comodidad a 128K de contexto; 8x H100 80GB (640 GB) puede ser ajustado y dependera de la longitud de contexto y del tamano de lote.
- **GPU de consumo**: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, o incluso 4x 4090 con 96 GB quedan muy por debajo del footprint requerido).
- **Opciones de despliegue**: `transformers` con `trust_remote_code`, `text-generation-inference` (TGI, etiquetado como compatible) y `vLLM` con soporte de `compressed-tensors`. La compatibilidad exacta con `llama.cpp` u `Ollama` no esta documentada.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros (total/activos) | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DeepSeek-V3 NVFP4+FP8, comunidad) | 671B / 37B | 128K | NVFP4 + FP8 dinamico | No disponible | HuggingFace (0 descargas) |
| DeepSeek-V3-BF16 (RedHatAI) | 671B / 37B | 128K | BF16 | Licencia de DeepSeek | HuggingFace |
| DeepSeek-V3 oficial (FP8 block-scaled) | 671B / 37B | 128K | FP8 | Licencia de DeepSeek | HuggingFace |
| DeepSeek-R1 | 671B / 37B | 128K | BF16 / FP8 | MIT | HuggingFace |

La diferencia principal frente al checkpoint BF16 de origen y frente a la version oficial FP8 es el ahorro de memoria que aporta el NVFP4, a cambio de una mayor dependencia de hardware Blackwell y de una receta de cuantizacion no documentada. DeepSeek-R1 comparte arquitectura y tamano, pero esta orientado a razonamiento y usa licencia MIT.

## Limitaciones y advertencias

- **Trazabilidad limitada**: el repositorio es una publicacion de la comunidad sin model card detallada, sin receta de calibracion y sin evaluacion de la perdida de calidad introducida por la cuantizacion.
- **Licencia incierta**: no se indica licencia en el repositorio; el uso comercial queda condicionado por la licencia del modelo base DeepSeek-V3, que debe verificarse antes de desplegar.
- **Dependencia de hardware**: el NVFP4 solo se aprovecha de forma nativa en Blackwell; en otras GPUs el rendimiento puede degradarse o requerir descompresion.
- **Riesgo de alucinacion**: como cualquier LLM, puede generar contenido verosimil pero incorrecto, especialmente en dominios especializados.
- **Idiomas**: el modelo base esta optimizado para ingles y chino; el rendimiento en castellano no esta documentado y deberia validarse.
- **Sin datos de benchmarks**: no hay evidencia publicada de que la cuantizacion conserve las capacidades del modelo base en razonamiento, codigo o matemáticas.
- **Madurez**: 0 descargas y 0 interacciones en el momento de redactar esta ficha; no hay senales de validacion por parte de la comunidad.
- **Formato**: requiere `trust_remote_code` y el stack `compressed-tensors`, lo que anade dependencias y complejidad de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/DeepSeek-V3-NVFP4-FP8-Dynamic-MTP
- Checkpoint base: https://huggingface.co/RedHatAI/DeepSeek-V3-BF16
- DeepSeek-V3 (modelo original): https://huggingface.co/deepseek-ai/DeepSeek-V3
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Repositorio de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
