# UlyssesXC/ftest-qwen3.5-9b

## Resumen

`UlyssesXC/ftest-qwen3.5-9b` es un ajuste fino de parámetros completos (full-parameter fine-tuning) sobre el modelo base `Qwen/Qwen3.5-9B`, publicado por el usuario UlyssesXC bajo licencia Apache 2.0. El repositorio no contiene un único modelo, sino un archivo de dos paquetes de checkpoint correspondientes a las épocas acumuladas 4 y 10; cada directorio `epoch-N` incluye los pesos, el tokenizador y la configuración. La época 10 continúa desde los pesos de la época 4, sin reanudar el estado del optimizador original.

Por su propia model card, el autor no formula ninguna afirmación de rendimiento ni de evaluación, y el repositorio no incluye pipeline declarado, idiomas soportados, ni resultados de benchmarks. El prefijo `ftest` del identificador sugiere un artefacto de prueba interna de un flujo de fine-tuning, más que un modelo destinado a distribución general; de hecho, acumula 0 descargas y 0 "likes" desde su creación.

Su relevancia para un desarrollador es, por tanto, la de un caso de estudio reproducible: permite inspeccionar cómo se empaquetan checkpoints intermedios de un fine-tuning completo, comparar dos puntos de la trayectoria de entrenamiento sobre un mismo modelo base, y verificar la compatibilidad de carga con la librería `transformers`. No es, con la información disponible, un modelo evaluado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base `Qwen/Qwen3.5-9B`; no documentada en la model card) |
| Parámetros totales | no confirmado. El identificador y el modelo base indican aproximadamente 9 000 millones; la model card no lo especifica |
| Parámetros activos | no aplica / no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en formato `safetensors`, sin variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería declarada: transformers) |
| Tamaño del repositorio | 37,7 GB (coherente con dos checkpoints en precisión de 16 bits de un modelo de ~9 000 millones de parámetros) |
| Estructura del repositorio | dos directorios `epoch-N` (épocas 4 y 10), cada uno con pesos, tokenizador y configuración |
| Modelo base | `Qwen/Qwen3.5-9B` |
| Compatibilidad declarada | `endpoints_compatible`, `transformers`, `safetensors` |
| Fecha de creación | 2026-09-28 |
| Fecha de última actualización | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo: al tratarse de un fine-tuning de parámetros completos, la topología (número de capas, cabezas de atención, tipo de atención, uso de MoE o de mecanismos híbridos) es la del modelo base `Qwen/Qwen3.5-9B`, cuyas especificaciones no se detallan en la model card ni en la información proporcionada. Lo único confirmado es que se trata de un ajuste de todos los parámetros, no de un adaptador tipo LoRA, y que el resultado se distribuye en `safetensors` cargables con `transformers`.

Sobre el procedimiento de entrenamiento se conocen tres datos concretos: se publican dos épocas acumuladas (4 y 10); la época 10 parte de los pesos de la época 4; y el estado del optimizador no se reanudó entre ambas. No se especifica el número de tokens de entrenamiento, la composición del dataset, la longitud de secuencia, la tasa de aprendizaje ni si hubo fases de alineación (RLHF, DPO u otras). El autor declara explícitamente que no se formulan afirmaciones de rendimiento derivadas de evaluación.

## Capacidades

No se han documentado capacidades específicas para este artefacto. La model card no enumera tareas soportadas, no declara soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento, y no indica cobertura multilingüe. Cualquier capacidad heredada del modelo base `Qwen/Qwen3.5-9B` debe verificarse empíricamente antes de asumirla, dado que:

- El ajuste fino de parámetros completos puede degradar capacidades del modelo base (olvido catastrófico) si el dataset de ajuste es estrecho o poco diverso.
- El autor no publica ninguna evaluación que confirme la preservación de dichas capacidades.
- Se desconoce el dataset de ajuste, por lo que no puede acotarse el dominio en el que el modelo ha sido especializado.

## Casos de uso

Los siguientes escenarios son realistas para un artefacto de esta naturaleza (checkpoints intermedios de un fine-tuning completo sin evaluar), no para un modelo listo para producción:

- Validación de pipelines internos de fine-tuning: usar los directorios `epoch-4` y `epoch-10` como casos de prueba para comprobar que un flujo propio de entrenamiento produce checkpoints cargables con `transformers`, con tokenizador y configuración consistentes.
- Estudio de la trayectoria de entrenamiento: comparar las salidas de la época 4 y la época 10 sobre un mismo conjunto de prompts fijos permite observar deriva de comportamiento, saturación o degradación entre puntos de control.
- Detección de olvido catastrófico: evaluar ambos checkpoints sobre un conjunto de tareas generales y comprobar si el ajuste ha erosionado capacidades del modelo base antes de decidir un despliegue.
- Punto de partida para ajuste adicional: al ser un fine-tuning completo con licencia Apache 2.0, puede servir como inicialización para un segundo ajuste (continuo o específico de dominio), siempre que se documente el dataset y se validen los resultados.
- Generación de datos sintéticos para experimentación interna: una vez validada la calidad de salida, el modelo puede emplearse para producir corpus de prueba en dominios controlados, con revisión humana obligatoria.
- Investigación sobre reproducibilidad: el repositorio documenta explícitamente la discontinuidad del estado del optimizador entre épocas, lo que lo convierte en un ejemplo útil para discutir y auditar prácticas de publicación de checkpoints.
- Despliegue en entornos de investigación con `transformers`: servir el modelo en una GPU de 40-80 GB para experimentos de laboratorio, sin garantías de latencia ni de estabilidad para cargas de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica literalmente que el autor no formula ninguna afirmación de rendimiento de evaluación, y no se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni de ningún otro conjunto.

## Requisitos de hardware

Estimaciones derivadas del tamaño declarado (aproximadamente 9 000 millones de parámetros) y del tamaño del repositorio; no proceden de mediciones publicadas por el autor:

- VRAM en precisión de 16 bits (bf16/fp16): en torno a 18 GB solo para pesos, más caché KV y activaciones; con contexto largo, conviene reservar 24-40 GB.
- VRAM en cuantización de 8 bits: aproximadamente 9-10 GB para pesos.
- VRAM en cuantización de 4 bits: aproximadamente 5-6 GB para pesos. No se publican variantes GGUF, AWQ ni GPTQ, por lo que habría que generarlas a partir de los `safetensors`.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para inferencia en bf16 sin cuantizar. En una RTX 4090 de 24 GB el modelo en bf16 es ajustado y probablemente requiera cuantización de 8 o 4 bits.
- GPU de consumo: una RTX 3090 o 4090 de 24 GB puede alojar el modelo únicamente con cuantización; una GPU de 12 GB exigiría cuantizaciones agresivas de 4 bits con ventanas de contexto reducidas.
- Opciones de despliegue: la vía natural es `transformers` con `safetensors`. El soporte en vLLM o TGI depende de que dichas herramientas reconozcan la arquitectura del modelo base `Qwen/Qwen3.5-9B`, dato no disponible. Ollama y llama.cpp requieren una conversión previa a GGUF que el repositorio no incluye.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo analizado, por lo que la comparación se limita a dimensiones estructurales. Se toman como referencia alternativas de tamaño comparable, siempre que su información sea pública y verificable:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| ftest-qwen3.5-9b (este) | ~9 000 M (no confirmado) | no disponible | apache-2.0 | HuggingFace, 0 descargas | no disponibles |
| Qwen/Qwen3.5-9B (base) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace | no disponibles en la información proporcionada |
| Alternativas de la misma franja (~7-9 000 M) | varía según modelo | varía según modelo | habitualmente permisivas en la familia Qwen y Mistral; Llama con licencia comunitaria propia | amplia en HuggingFace | no comparables aquí al no disponer de métricas del modelo analizado |

No es posible establecer una comparación de rendimiento rigurosa sin evaluaciones publicadas del modelo objeto de la ficha.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor declara explícitamente que no formula afirmaciones de rendimiento. No hay ninguna métrica que respalde calidad, robustez o seguridad.
- Artefacto de prueba: el identificador `ftest` y la ausencia de descargas apuntan a un repositorio de experimentación interna, no a un modelo mantenido.
- Estructura no estándar: al no existir un checkpoint en la raíz del repositorio, las herramientas que cargan directamente desde el identificador del modelo pueden fallar; hay que apuntar explícitamente al subdirectorio `epoch-N`.
- Dataset de ajuste desconocido: no se especifica composición, idioma, licencia ni procedencia de los datos de entrenamiento, lo que impide auditar sesgos, contaminación de benchmarks o restricciones de uso derivadas.
- Riesgo de olvido catastrófico: un fine-tuning de parámetros completos sin evaluación puede haber degradado capacidades generales del modelo base. Es imprescindible comparar ambos checkpoints contra la referencia base.
- Riesgo de alucinación: no acotado ni medido. Se desconoce si el ajuste lo incrementa o lo reduce.
- Idiomas y contexto: no declarados. No debe asumirse cobertura multilingüe ni una ventana de contexto concreta.
- Restricciones de licencia: el repositorio se publica bajo Apache 2.0, que permite uso comercial. No obstante, la licencia y las condiciones del modelo base `Qwen/Qwen3.5-9B` y de los datos de ajuste no se detallan, por lo que conviene verificarlas antes de cualquier explotación comercial.
- Uso en producción: no recomendado con la información disponible, salvo que el equipo realice su propia batería de evaluaciones de calidad, sesgo, seguridad y coste.
- Estado del optimizador no reanudado: la época 10 parte de los pesos de la época 4 sin continuidad del optimizador, lo que introduce una discontinuidad en la trayectoria de entrenamiento que debe tenerse en cuenta al interpretar resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UlyssesXC/ftest-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
