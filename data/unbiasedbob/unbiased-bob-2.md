# UnbiasedBob/Unbiased-Bob-2

## Resumen

Unbiased Bob 2 es una modificación satírica del modelo Qwen3.6-35B-A3B publicada por el usuario UnbiasedBob en Hugging Face. No se trata de un modelo entrenado ni ajustado, sino de una cuantización GGUF del modelo base de Alibaba Cloud en la que se han puesto a cero 960 parámetros correspondientes a los sesgos `ssm_dt.bias` de las capas de espacio de estados híbridas. El autor lo presenta explícitamente como una obra de sátira dirigida a otras publicaciones de modelos derivados sin entrenamiento real.

El modelo conserva la arquitectura del Qwen3.6-35B-A3B: un transformer híbrido con mezcla de expertos dispersa, 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. La modificación afecta a 3.840 bytes de un fichero de unos 21 GB, es decir, aproximadamente el 0,0000027 % de los parámetros, por lo que el comportamiento funcional es prácticamente idéntico al del modelo base cuantizado.

Su relevancia es fundamentalmente divulgativa y crítica: sirve como ejemplo de cómo una intervención trivial sobre los pesos puede presentarse con lenguaje grandilocuente, y advierte al lector sobre la necesidad de verificar qué contiene realmente un modelo publicado antes de evaluarlo o desplegarlo. No debe considerarse una alternativa funcional a Qwen3.6-35B-A3B para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (MoE) y capas de espacio de estados (SSM, tipo Mamba) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (3B-A3B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF `UD-Q4_K_M` (procedente de la cuantización de Unsloth); sin otras variantes publicadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | GGUF (fichero de aproximadamente 21 GB; repositorio de 22,7 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida que combina capas de atención con capas de espacio de estados (SSM) del tipo Mamba, organizadas en un esquema de mezcla de expertos dispersa. Cada capa SSM incluye un tensor `ssm_dt.bias` de 32 valores en float32 que se suma al paso temporal antes de aplicar `softplus`, controlando la velocidad de olvido del estado oculto. En total, la arquitectura contiene 30 tensores de este tipo, sumando 960 parámetros.

La modificación de Unbiased Bob 2 consiste en poner a cero esos 30 tensores de sesgo directamente sobre el fichero GGUF, sin recuantizar. El autor documenta que los valores originales alcanzaban ±7,31 antes del parche y que la salida diverge del Qwen original desde el primer token. No hubo entrenamiento, ajuste posterior, RLHF ni DPO de ningún tipo. La cuantización `UD-Q4_K_M` procede del repositorio de Unsloth y se ha reutilizado sin cambios, por lo que la calidad de cuantización es idéntica a la del original. El script `zero_biases.py` realiza un mapeo en memoria del GGUF y escribe ceros sobre los tensores de sesgo, sin necesidad de recuantizar.

## Capacidades

- Generación de texto conversacional, con introducciones propias coherentes según el autor.
- Razonamiento y resolución de problemas aritméticos simples (el autor cita un ejemplo aislado de `17 * 23` con resultado incorrecto, 391, en muestreo greedy).
- Hereda las capacidades del modelo base Qwen3.6-35B-A3B, si bien no se documentan en la model card.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Modo de razonamiento extendido (thinking): no documentado.
- Visión o audio: no documentado.

## Casos de uso

- Docencia y divulgación sobre integridad de modelos: sirve para ilustrar cómo una modificación de 3.840 bytes puede presentarse como un modelo nuevo, y para enseñar a auditar fichas de modelos y diferencias de pesos antes de adoptarlos.
- Pruebas de robustez de pipelines de evaluación: al divergir del Qwen original desde el primer token, puede emplearse para comprobar que un sistema de evaluación detecta variaciones de comportamiento respecto al modelo de referencia.
- Análisis forense de ficheros GGUF: el script de puesta a cero y la documentación de los tensores `ssm_dt.bias` son un ejemplo práctico de inspección y modificación de metadatos y pesos en formato GGUF.
- Demostraciones de inferencia local: con aproximadamente 21 GB en Q4_K_M y velocidades del orden de 86 tok/s en un Apple M3 Ultra según el autor, permite ejecutar un MoE de 35B en hardware de gama alta de consumo o estación de trabajo.
- Ejercicios de crítica a la cultura de publicación de modelos: útil en charlas o artículos sobre modelos derivados sin entrenamiento, nomenclatura engañosa y métricas sin respaldo estadístico.
- Pruebas de carga y despliegue con llama.cpp: compatible con `llama-cli` y `--jinja`, sirve para validar flujos de despliegue de GGUF en entornos de prueba, no en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona únicamente una observación anecdótica (n=1, sin valor estadístico) de aproximadamente 86 tok/s en un Apple M3 Ultra y un ejemplo de aritmética incorrecta en muestreo greedy. No se aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estandarizada.

## Requisitos de hardware

- VRAM estimada: en torno a 21-23 GB para el fichero `UD-Q4_K_M` completo; se requiere memoria suficiente para el modelo y el contexto, por lo que conviene prever 24 GB o más.
- GPU recomendadas: RTX 4090 (24 GB) para el cuantizado Q4_K_M; A100 40/80 GB, H100 o L40S para mayor contexto y concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090); en tarjetas de 16 GB requeriría cuantizaciones más agresivas, no publicadas en este repositorio.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, otros runners basados en llama.cpp como Ollama o LM Studio; vLLM y TGI requerirían pesos en safetensors, no incluidos.
- Latencia y throughput: aproximadamente 86 tok/s en Apple M3 Ultra según el autor; no hay mediciones publicadas en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Unbiased Bob 2 | 35,5B totales / ~3B activos | No disponible | Apache 2.0 | GGUF Q4_K_M | Modificación satírica de 960 parámetros sobre Qwen3.6-35B-A3B |
| Qwen/Qwen3.6-35B-A3B | 35,5B totales / ~3B activos | No disponible | Apache 2.0 | Safetensors (modelo original) | Modelo base de Alibaba Cloud; referencia funcional real |
| unsloth/Qwen3.6-35B-A3B-MTP-GGUF | 35,5B totales / ~3B activos | No disponible | Apache 2.0 | GGUF (varias cuantizaciones) | Cuantización de referencia utilizada sin cambios por Unbiased Bob 2 |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo satírico: el autor lo declara explícitamente como obra de sátira; no debe tratarse como un modelo nuevo ni como una mejora del base.
- Sin entrenamiento ni ajuste: no se realizó entrenamiento, post-entrenamiento ni RL; las capacidades son las del Qwen3.6-35B-A3B cuantizado, con la salvedad de la modificación de sesgos.
- Divergencia de comportamiento: la puesta a cero de `ssm_dt.bias` altera el paso temporal de las capas SSM y la salida diverge del modelo original desde el primer token; el impacto cualitativo no está evaluado de forma sistemática.
- Riesgo de alucinación: no evaluado; el único ejemplo aritmético citado por el autor es incorrecto (391 en lugar de 391 para `17 * 23`), lo que no permite extraer conclusiones.
- Idiomas y contexto: no documentados; no se puede garantizar el comportamiento multilingüe ni la ventana de contexto efectiva.
- Licencia: Apache 2.0 heredada de Qwen3.6-35B-A3B, con aviso de modificación conforme a la sección 4b; no es un producto de Alibaba ni está respaldado por el equipo de Qwen.
- Uso en producción: no recomendado; para cargas reales debe utilizarse el modelo base o su cuantización original de Unsloth.
- Métricas del autor: la cifra de "98,2 % de la inteligencia del modelo base" no está respaldada por ninguna evaluación y debe interpretarse como parte de la sátira.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UnbiasedBob/Unbiased-Bob-2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Cuantización de Unsloth utilizada: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
