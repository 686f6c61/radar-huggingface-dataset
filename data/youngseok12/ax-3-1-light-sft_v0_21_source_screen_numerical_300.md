# youngseok12/AX-3.1-Light-sft_v0_21_source_screen_numerical_300

## Resumen

El modelo **AX-3.1-Light-sft_v0_21_source_screen_numerical_300** es un fine-tuning experimental del modelo base **skt/A.X-3.1-Light**, desarrollado por el usuario HuggingFace *youngseok12*. Se trata de una variante de "source-screening" (cribado de fuentes) que sustituye 300 filas del conjunto de entrenamiento original por ejemplos de machine reading numérico procedentes del dataset AIHub-71568 (숫자연산 기계독해). El objetivo es evaluar cómo afecta esta sustitución controlada al rendimiento del modelo en tareas de razonamiento numérico y comprensión lectora en coreano.

El modelo es un LoRA-merged standalone en formato BF16, con aproximadamente 7.260 millones de parámetros (7.3B), y hereda la arquitectura tipo Llama del modelo base. Está pensado exclusivamente para investigación y evaluación controlada en coreano, y no incluye datos de benchmarks, respuestas de evaluación ni credenciales de acceso en el repositorio. Su relevancia radica en que forma parte de una serie de experimentos de ablación sobre la composición de datos de entrenamiento, con resultados locales publicados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (base: skt/A.X-3.1-Light) |
| Parametros totales | 7.264.800.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max_seq_len 2048) |
| Tipos de cuantizacion | no disponible (solo BF16 safetensors en el repo) |
| Idiomas soportados | ko (coreano) |
| Licencia | Apache 2.0 (con condiciones adicionales de AI Hub sobre los datos de entrenamiento) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo base skt/A.X-3.1-Light, que emplea una estructura transformer tipo Llama con atención causal estándar. El fine-tuning se realizó mediante LoRA (rank 16, alpha 32, dropout 0.05) sobre las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, y posteriormente se fusionó el adaptador en los pesos completos. El entrenamiento fue de una sola época, con una tasa de aprendizaje de 5e-5, optimizador AdamW fusionado, scheduler lineal sin warmup, weight decay 0.0 y gradiente máximo de norma 1.0. Se usó un batch efectivo de 8 (batch por dispositivo 1, acumulación de gradiente 8) y una longitud máxima de secuencia de 2048 tokens, con packing deshabilitado.

El conjunto de datos de entrenamiento contiene 5.801 filas de una mezcla "v0.21-equivalent" de cribado de fuentes: 5.501 filas sin cambios y 300 filas reemplazadas por ejemplos del dataset AIHub-71568 de machine reading numérico. La selección de esos 300 ejemplos fue determinista con semilla 20260829, sin usar ningún criterio de calidad, ranking o scoring. Los benchmarks públicos (KMMLU-Pro, CLIcK, HLE, SNU Ko-MuSR, Com2-main, MuSR) no se incluyeron como datos de SFT.

## Capacidades

- Generación de texto en coreano con formato conversacional (usa el chat template oficial del tokenizer de A.X).
- Razonamiento numérico y machine reading sobre textos, gracias a los 300 ejemplos específicos de sustitución.
- Comprensión lectora multihop (evaluado en SNU Ko-MuSR y Com2-main).
- Capacidad de seguir instrucciones de tipo asistente (entrenado con objetivo de cross-entropy solo sobre respuestas del asistente).
- Sin soporte declarado de tool calling, agentes, visión o audio (no se menciona en la documentación).
- Multilingüismo limitado al coreano; no se documentan capacidades en otros idiomas.

## Casos de uso

- **Evaluación de cribado de fuentes en investigación**: el modelo sirve para estudiar cómo la sustitución de datos numéricos altera el rendimiento en benchmarks coreanos, útil para investigadores que analizan el impacto de la composición de datos en SFT.
- **Prototipado de asistentes conversacionales en coreano**: puede integrarse en entornos de investigación para generar respuestas en diálogos de dominio general, aunque con cautela por su naturaleza experimental.
- **Pruebas de razonamiento numérico en textos**: dado el refuerzo específico en machine reading numérico, puede usarse como banco de pruebas para tareas de extracción y cálculo sobre documentos coreanos.
- **Comparación de metodologías de fine-tuning**: al ser un LoRA-merged con hiperparámetros documentados, sirve como referencia para reproducir experimentos de ablación en pipelines de entrenamiento.
- **Análisis de robustez frente a datos contaminados**: al no incluir benchmarks en el entrenamiento, puede usarse para medir la generalización del modelo base tras un SFT controlado.
- **Desarrollo de pipelines de evaluación local**: su formato estándar (safetensors, sin trust_remote_code) facilita su integración en suites de evaluación automática como las descritas en la model card.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son evaluaciones locales (no oficiales del K-AI leaderboard) realizadas con sondas libres y restringidas B1_constrained sobre 21.962 filas por modelo, con cero errores de generación. Son resultados de precisión parseada en la variante B1_constrained.

| Benchmark | Resultado |
|---|---|
| KMMLU-Pro | 40,54 % |
| CLIcK | 64,31 % |
| HLE (Ko) | 4,31 % |
| SNU Ko-MuSR | 55,07 % |
| Com2-main (Ko) | 52,40 % |
| Media de cinco ejes | 43,33 % |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo pesa aproximadamente 14,5 GB en BF16. Para cargar en BF16 se necesitan al menos 16 GB de VRAM. Con cuantización a 8 bits (no proporcionada en el repo, pero posible con herramientas externas) se reduciría a ~8 GB, y a 4 bits a ~4-5 GB.
- **GPUs recomendadas**: una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) son suficientes para BF16 completo. En consumer GPUs de 8-12 GB solo sería viable con cuantización.
- **Compatibilidad con consumer GPU**: sí, si se cuantiza el modelo (p.ej. a 4 bits) cabe en una RTX 3060 de 12 GB o similar.
- **Opciones de despliegue**: compatible con Transformers (AutoModelForCausalLM, AutoTokenizer), vLLM estándar, y probablemente con llama.cpp u Ollama mediante conversión a GGUF (no incluida en el repo).
- **Latencia y throughput**: no se proporcionan datos específicos. Para un modelo de 7B en BF16 en una GPU moderna, se espera un throughput de decenas de tokens por segundo en vLLM, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente en el repositorio ni en los resultados de búsqueda para establecer una comparativa rigurosa con otros modelos de la misma categoría (p.ej. el propio modelo base A.X-3.1-Light u otros modelos coreanos de 7B como Polyglot-Ko-7B o EEVE-Korean-7B). Se recomienda consultar el K-AI leaderboard para obtener comparaciones oficiales. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- **Modelo experimental**: no está pensado para uso en producción ni como sustituto de asesoramiento profesional (legal, contable, médico o financiero).
- **Riesgo de alucinación**: puede producir errores factuales, especialmente en tareas numéricas fuera de su dominio de entrenamiento.
- **Idioma limitado**: solo se documenta soporte para coreano; el rendimiento en otros idiomas no está evaluado.
- **Contexto limitado**: aunque el modelo base podría soportar más tokens, el entrenamiento se realizó con secuencias de máximo 2048 tokens; no se documenta la longitud de contexto real en inferencia.
- **Sesgos desconocidos**: no se han publicado análisis de sesgos; al ser un fine-tuning sobre datos coreanos de AI Hub, puede heredar sesgos presentes en esos datos.
- **Restricciones de licencia**: aunque la licencia del modelo base es Apache 2.0, los términos de uso de los datos de AI Hub (AIHub-71568) siguen vigentes y pueden imponer condiciones adicionales para uso comercial o redistribución.
- **Reproducibilidad**: el repositorio no incluye logs de entrenamiento ni datos de evaluación completos, lo que limita la verificación independiente de los resultados.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/youngseok12/AX-3.1-Light-sft_v0_21_source_screen_numerical_300)
- [Modelo base skt/A.X-3.1-Light](https://huggingface.co/skt/A.X-3.1-Light) (referencia en la model card)
