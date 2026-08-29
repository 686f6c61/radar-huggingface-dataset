# wangzhang/Llama-3-8B-Instruct-RR-Abliterated

## Resumen

Llama-3-8B-Instruct-RR-Abliterated es un modelo de 8.030 millones de parámetros derivado de Llama-3-8B-Instruct, al que se le ha eliminado el circuito de seguridad basado en Representation Rerouting (Circuit Breakers) implementado por GraySwanAI en su versión Llama-3-8B-Instruct-RR. El autor, Wangzhang Wu, ha desarrollado este modelo como un reemplazo directo del checkpoint de GraySwan, pero sin los mecanismos de rechazo de contenido dañino, utilizando la herramienta abliterix sin realizar fine-tuning ni actualizaciones de gradiente.

El modelo es relevante para la investigación en seguridad de IA, ya que demuestra que los circuitos de seguridad basados en rerouting de representaciones pueden ser eliminados mediante intervención en el espacio de pesos, sin necesidad de entrenamiento adicional. Esto permite estudiar la robustez de las defensas y reproducir experimentos de abliteración. La arquitectura es un transformer decoder-only estándar de Llama 3, con una ventana de contexto de 8192 tokens y soporte para inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No especificada; compatible con cuantizacion estandar (bitsandbytes, GPTQ, AWQ, GGUF) |
| Idiomas soportados | Ingles, chino |
| Licencia | Meta Llama 3 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es GraySwanAI/Llama-3-8B-Instruct-RR, que a su vez se construyó aplicando un LoRA delta de rango 16 sobre NousResearch/Meta-Llama-3-8B-Instruct. El análisis SVD de la diferencia de pesos entre el modelo RR y el base confirma la estructura de rango 16 en las proyecciones v_proj, o_proj y gate_proj. Para crear este modelo, se eliminó completamente el delta LoRA (λ=0.0) y posteriormente se aplicó una abliteración de una sola dirección con abliterix, usando los parámetros óptimos encontrados en 60 ensayos (vector_method=mean, n_directions=1, steering_mode=direct, decay_kernel=linear, strength_range=[1.5, 6.0]). No hubo entrenamiento con gradientes ni ajuste de pesos adicional.

## Capacidades

- Generacion de texto conversacional en ingles y chino, heredada de Llama-3-8B-Instruct.
- Sin rechazo de contenido dañino: el modelo responde a peticiones que normalmente serian bloqueadas por los circuitos de seguridad.
- Soporte de tool calling y function calling no documentado explicitamente, pero hereda las capacidades basicas de Llama-3-8B-Instruct mediante prompting.
- No incluye capacidades de vision, audio ni modo de razonamiento explicito.
- Compatible con el chat template de Llama 3 y con pipelines de transformers.

## Casos de uso

- Investigacion en seguridad de IA: permite estudiar como funcionan los circuitos de seguridad basados en rerouting de representaciones y como pueden ser eliminados, contribuyendo al desarrollo de defensas mas robustas.
- Red-teaming de modelos: util para probar la eficacia de ataques adversariales y evaluar la resistencia de otros modelos con salvaguardas.
- Reproducibilidad de experimentos de abliteracion: sirve como referencia para verificar las afirmaciones sobre la eliminacion de circuitos de seguridad publicadas en la literatura.
- Analisis de comportamiento sin restricciones: permite estudiar el comportamiento del modelo cuando no hay mecanismos de rechazo, por ejemplo, para entender sesgos o patrones de generacion.
- Comparacion de robustez: se puede utilizar como baseline para comparar la eficacia de diferentes defensas (Circuit Breakers, RLHF, etc.) en un mismo modelo base.
- Generacion de texto sin censura en entornos controlados de investigacion, siempre que se cumplan las restricciones legales y eticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card proporciona metricas especificas de rechazo y ataque, que se resumen a continuacion:

| Metrica | GraySwanAI/Llama-3-8B-Instruct-RR (base) | Este modelo |
|---|---|---|
| Tasa de rechazo (100 prompts dañinos, juez LLM) | 99 / 100 | 1 / 100 |
| Attack Success Rate | No disponible | 99 % |
| Divergencia KL vs base | — | 0.017 |
| Hardcore 15 (10 EN + 5 CN) | No disponible | 15 / 15 compliant |

Estos datos indican que la eliminacion del circuito de seguridad es efectiva, pero no proporcionan informacion sobre la calidad general de generacion de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion de 4 bits, aproximadamente 6-8 GB; con 8 bits, 8-10 GB; en bfloat16 (formato original), unos 16 GB.
- GPU recomendadas: para cuantizacion 4-bit, una RTX 3060/4060 de 8 GB o superior; para bfloat16, una RTX 3090/4090 o A100.
- Cabe en GPUs de consumo con cuantizacion, pero no en su formato original sin reducir precision.
- Opciones de despliegue: transformers (Hugging Face), vLLM, llama.cpp, Ollama, TGI, FriendliAI (con cuantizacion FP4/FP8/INT4/INT8).
- Latencia y throughput: no disponibles; dependen del hardware y la configuracion de despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Caracteristicas de seguridad |
|---|---|---|---|---|
| wangzhang/Llama-3-8B-Instruct-RR-Abliterated | 8.03 B | 8192 | Llama 3 Community | Sin circuitos de seguridad (abliterado) |
| GraySwanAI/Llama-3-8B-Instruct-RR | 8.03 B | 8192 | Llama 3 Community | Circuit Breakers (Representation Rerouting) |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.03 B | 8192 | Llama 3 Community | RLHF estandar, rechazo de contenido dañino |

La comparativa muestra que este modelo es funcionalmente identico al de GraySwan excepto por la eliminacion del circuito de seguridad, y que se diferencia del original de Meta por carecer de los mecanismos de rechazo entrenados con RLHF.

## Limitaciones y advertencias

- El modelo no tiene salvaguardas: puede generar contenido dañino, ilegal, violento o sexualmente explicito. El autor declara explicitamente que el usuario es responsable de cualquier output.
- Riesgo de alucinacion: al ser un modelo de 8B, puede producir informacion falsa o inventada, especialmente en temas especializados.
- Limitaciones de idioma: solo ingles y chino; no soporta otros idiomas de forma fiable.
- Restricciones de licencia: la Meta Llama 3 Community License permite uso comercial, pero impone condiciones (por ejemplo, no usar para mejorar otros modelos grandes sin autorizacion). Ademas, el uso de este modelo en aplicaciones de produccion sin supervision humana es desaconsejable.
- No apto para despliegue en entornos no controlados: su falta de rechazo lo hace inadecuado para chatbots publicos o asistentes sin moderacion adicional.
- La eliminacion del circuito de seguridad puede no ser completa en todos los escenarios; la tasa de rechazo del 1 % indica que aun hay casos residuales.

## Enlaces

- Hugging Face: https://huggingface.co/wangzhang/Llama-3-8B-Instruct-RR-Abliterated
- Repositorio abliterix: https://github.com/wuwangzhang1216/abliterix
- Paper Circuit Breakers (Zou et al., NeurIPS 2024): https://arxiv.org/abs/2406.04313
- Modelo base GraySwanAI/Llama-3-8B-Instruct-RR: https://huggingface.co/GraySwanAI/Llama-3-8B-Instruct-RR
- Modelo original meta-llama/Meta-Llama-3-8B-Instruct: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
