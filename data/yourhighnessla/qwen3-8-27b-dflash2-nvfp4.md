# YourHighnessLA/Qwen3.8-27B-DFlash2-NVFP4

## Resumen

Qwen3.8-27B-DFlash2-NVFP4 es un modelo de borrador (draft model) cuantizado en formato NVFP4, diseñado para acelerar la inferencia del modelo Qwen3.8-27B mediante decodificación especulativa con el método DFlash2. Lo desarrolla el usuario YourHighnessLA, a partir del drafter original z-lab/Qwen3.8-27B-DFlash2, y está optimizado para la pila de vLLM con todos los componentes en NVFP4 (pesos objetivo, pesos de borrador y caché KV). Su propósito es reducir el coste de memoria y mejorar la velocidad de generación en GPUs con soporte SM120 (por ejemplo, RTX 5090), manteniendo una ventana de contexto de hasta 262 144 tokens.

El modelo no es un modelo de lenguaje completo, sino un componente auxiliar que propone tokens candidatos para el modelo principal. Tiene 1.92 mil millones de parámetros distribuidos en 5 capas de estilo Qwen3, y comparte las capas de embedding y de salida (lm_head) con el modelo objetivo, por lo que no se puede usar de forma autónoma. La cuantización es de solo pesos, con formato W4A16 (grupo de 16), redondeo al más cercano y sin calibración, lo que garantiza una reproducción exacta del comportamiento del drafter original en modo greedy.

Este modelo es relevante porque permite desplegar Qwen3.8-27B con contexto largo en hardware de consumo (SM120) manteniendo un rendimiento competitivo, y porque forma parte de un ecosistema de decodificación especulativa que multiplica por cerca de tres la velocidad de autoregresión. Su licencia Apache 2.0 facilita su uso en producción y en investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de 5 capas (estilo Qwen3) como drafter para DFlash2 |
| Parámetros totales | 1.924.404.480 (~1,92 mil millones) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (verificado en la configuración all-NVFP4) |
| Tipos de cuantización | NVFP4 (W4A16, grupo de 16) con escalas en FP8 (e4m3) y escala global en FP32 |
| Idiomas soportados | No disponible (el drafter no tiene capacidades lingüísticas propias; depende del modelo objetivo) |
| Licencia | Apache-2.0 |
| Formato de pesos | compressed-tensors (safetensors) en formato NVFP4 empaquetado |

## Arquitectura y entrenamiento

El modelo es un drafter para la decodificación especulativa DFlash2, una técnica que utiliza un modelo pequeño para proponer múltiples tokens candidatos en paralelo, que luego son verificados por el modelo grande. El drafter consta de 5 capas de transformer de estilo Qwen3 y 1,92 mil millones de parámetros. No se proporcionan detalles sobre el entrenamiento del drafter original (datos, número de tokens, métodos de optimización), pero el autor indica que esta versión es una requantización de solo pesos del checkpoint BF16 de z-lab/Qwen3.8-27B-DFlash2.

La cuantización se realiza con el método de redondeo al más cercano (round-to-nearest) sin calibración, utilizando la librería `compressed_tensors` 0.17.0 y el empaquetado de tensores FP4 a uint8. Se cuantifican las matrices de proyección de atención (q, k, v, o) y las capas MLP (gate, up, down) y la capa `fc`, en total 36 matrices. En cambio, se mantienen en BF16 las capas `kernel_projection`, `candidate_selector`, `hidden_projection` y las normalizaciones, ya que son críticas para el funcionamiento del drafter. El proceso es reproducible mediante el script `scripts/build_nvfp4_draft.py` incluido en el repositorio de vLLM-sm12x DFlash2.

## Capacidades

- Decodificación especificativa con DFlash2: genera hasta 3 tokens candidatos por paso (K=3) y alcanza una tasa de aceptación media de 2,35 tokens por candidato (44,9 % de aceptación).
- Compatibilidad con la pila all-NVFP4 de vLLM: funciona junto con pesos objetivo NVFP4, pesos de borrador NVFP4 y caché KV NVFP4 en GPUs SM120.
- Determinismo byte-idéntico en modo greedy (según la documentación del autor).
- No es un modelo de lenguaje completo: no genera texto de forma autónoma, no soporta tool calling, ni razonamiento, ni visión. Todas las capacidades del sistema dependen del modelo objetivo (Qwen3.8-27B).
- Soporte de contexto largo: verificado con 262.144 tokens en la configuración all-NVFP4, con una pool de KV de 208.765 tokens (1,30× de la ventana).

## Casos de uso

- Inferencia acelerada de Qwen3.8-27B en producción: el drafter se integra en vLLM como parte de la configuración especulativa, reduciendo la latencia de generación hasta 3 veces respecto a la decodificación autoregresiva. Adecuado para servicios de chat o agentes que requieren respuestas rápidas.
- Despliegue en GPUs con soporte NVFP4 (SM120, por ejemplo RTX 5090): permite ejecutar el modelo objetivo con contexto de 262K tokens sin agotar la VRAM, gracias al uso de cuantización NVFP4 en todos los componentes.
- Aplicaciones de procesamiento de documentos largos: el contexto de 262K tokens permite analizar libros, código fuente extenso o informes completos en una sola pasada, con una latencia reducida gracias al drafter.
- Sistemas de agentes con múltiples pasos: la baja latencia de la decodificación especulativa permite iterar rápidamente sobre herramientas y razonamientos, mejorando la experiencia de usuario en entornos interactivos.
- Entornos de investigación en decodificación especulativa: el modelo sirve como referencia para comparar el rendimiento de drafteres cuantizados en NVFP4 frente a versiones en BF16 o FP16.
- Infraestructura de servidores de inferencia con presupuesto de memoria ajustado: al compartir embeddings y lm_head con el modelo objetivo, el drafter añade solo ~1,4 GB de pesos, lo que minimiza el incremento de VRAM requerido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas de lenguaje (MMLU, HumanEval, GSM8K, etc.) porque este modelo no es un modelo de lenguaje autónomo. Los únicos datos de rendimiento disponibles se refieren a la eficiencia de la decodificación especulativa:

| Métrica | Valor |
|---|---|
| Tasa de aceptación media | 2,35 tokens por paso |
| Porcentaje de tokens aceptados | 44,9 % |
| Velocidad relativa (según DFlash2) | ~3× la decodificación autoregular |
| Contexto máximo verificado | 262.144 tokens |
| Pool de tokens KV NVFP4 | 341.765 tokens (1,30× de la ventana) |

Estos datos fueron medidos en una configuración all-NVFP4 sobre una GPU SM120 con vLLM, y son reproducibles con el comando proporcionado en la model card.

## Requisitos de hardware

- VRAM estimada: el drafter ocupa aproximadamente 1,4 GB en pesos NVFP4 (según el tamaño del repositorio). Sin embargo, el modelo objetivo Qwen3.8-27B en NVFP4 (W4A16) requiere unos 14 GB de VRAM para sus pesos, más la caché KV NVFP4. Para una ventana de 262K tokens, se necesita una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 5090).
- GPU recomendadas: arquitectura SM120 (NVIDIA Blackwell, por ejemplo RTX 5090). No se garantiza compatibilidad con GPUs sin soporte NVFP4 (por ejemplo, Ampere o Turing).
- Opciones de despliegue: vLLM con la configuración de decodificación especulativa DFlash2, incluyendo `--speculative-config`, `--kv-cache-dtype nvfp4` y `--max-model-len 262144`. No se menciona soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no se proporcionan cifras absolutas, pero el autor indica que el sistema completo (modelo objetivo + drafter) logra una velocidad de decodificación cercana a 3 veces la de la autoregresión, con una aceptación media de 2,35 tokens por paso.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Cuantización | Licencia | Uso |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-DFlash2-NVFP4 (este) | Drafter de 5 capas (Qwen3) | 1,92 B | 262K (verificado) | NVFP4 (W4A16) | Apache-2.0 | Solo como drafter |
| z-lab/Qwen3.8-27B-DFlash2 (original) | Drafter de 5 capas (Qwen3) | 1,92 B | No especificado | BF16 | Apache-2.0 | Solo como drafter |
| Qwen/Qwen3.8-27B (modelo objetivo) | Transformer MoE (?) | 27 B | 256K | BF16/FP16 | Apache-2.0 | Modelo de lenguaje completo |

La comparativa se limita a los modelos directamente relacionados porque no hay información pública sobre otros drafteres cuantizados en NVFP4. El drafter NVFP4 ofrece una ventaja clara: reduce el consumo de memoria en un 75% respecto al BF16 (con W4A16) y permite integrarse en la pila all-NVFP4, mientras que el drafter original en BF16 no es compatible con esa configuración.

## Limitaciones y advertencias

- El modelo no es autónomo: no puede generar texto ni responder a prompts por sí mismo. Debe usarse estrictamente como drafter dentro de un sistema de decodificación especulativa con el modelo objetivo Qwen3.8-27B.
- Requiere hardware específico: la cuantización NVFP4 solo funciona en GPUs con soporte para SM120 (por ejemplo, RTX 5090). En otras GPUs, el modelo no se puede cargar o se degradaría el rendimiento.
- La cuantización puede introducir pérdidas de precisión en tareas sensibles a la precisión numérica, aunque la documentación indica que el comportamiento greedy es byte-idéntico al modelo BF16.
- No se han publicado evaluaciones de sesgos o alucinaciones, ya que el modelo no genera contenido propio. Sin embargo, hereda las limitaciones del modelo objetivo en cuanto a sesgos y errores.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento o la seguridad.
- El proyecto parece estar en una fase experimental (0 descargas, 0 likes), por lo que se recomienda validar su comportamiento en un entorno de pruebas antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YourHighnessLA/Qwen3.8-27B-DFlash2-NVFP4
- Modelo base (drafter original): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Hilo en foros de NVIDIA sobre DFlash2: https://forums.developer.nvidia.com/t/qwen-3-8-27b-dflash2/380617
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Repositorio de vLLM Recipes para NVFP4: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
