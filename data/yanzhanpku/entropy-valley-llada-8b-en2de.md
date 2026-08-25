# YanZhanPKU/Entropy-Valley-LLaDA-8B-En2De

## Resumen

Entropy-Valley-LLaDA-8B-En2De es un adaptador LoRA oficial para el modelo base GSAI-ML/LLaDA-8B-Base (8.02B parámetros, masked diffusion language model), desarrollado por YanZhanPKU como parte del proyecto Entropy-Valley presentado en EMNLP 2026. El adaptador convierte el modelo base en un sistema de traducción automática inglés→alemán mediante decodificación por difusión enmascarada, resolviendo el problema de que estos modelos requieren conocer la longitud del canvas de destino antes de comenzar la decodificación.

La contribución principal es Entropy-Valley (EV), un selector de longitud adaptativo que opera en tiempo de decodificación sin entrenamiento adicional: realiza una pasada forward con el canvas completamente enmascarado para cada longitud candidata, puntúa cada una por la entropía predictiva media sobre los primeros L-1 slots, y decodifica con la longitud de menor entropía. Este adaptador es el backbone fijo que EV utiliza para decodificar, y los mismos pesos sirven para las condiciones de longitud fija, oráculo y EV.

El repositorio libera una de las tres ejecuciones de entrenamiento cuyos resultados medios se reportan en el paper. En el benchmark WMT22 En→De (N=2.037), EV cierra el 33.0 % de la distancia entre la decodificación con ratio fijo 1.8 y el oráculo de longitud, obteniendo COMET-22 de 0.7240 y sacreBLEU de 21.55. La dirección En→De se incluye como comprobación a escala equivalente, no como dirección principal del paper; las ganancias son menores que en En→Zh y Zh→En.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre GSAI-ML/LLaDA-8B-Base (Transformer de difusión enmascarada) |
| Parámetros totales | 8.02B (modelo base) + LoRA r=64, α=128, dropout 0.05 sobre q/k/v/o_proj, ff_proj/up_proj/ff_out |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base LLaDA-8B-Base; la decodificación usa canvas de longitud adaptativa) |
| Tipos de cuantización | No disponible (entrenado en bf16; safetensors) |
| Idiomas soportados | Inglés (fuente), alemán (destino) |
| Licencia | llada-8b-base-license (enlace: https://huggingface.co/GSAI-ML/LLaDA-8B-Base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base LLaDA-8B-Base es un modelo de difusión de lenguaje enmascarado (masked diffusion language model) de 8.02B parámetros, entrenado desde cero bajo el paradigma de pre-entrenamiento y SFT, tal como se describe en el paper "Large Language Diffusion Models" (arXiv:2502.09992). A diferencia de un decodificador autorregresivo que genera hasta emitir EOS, un decodificador de difusión enmascarada rellena un canvas de tamaño fijo: debe conocer el número de slots objetivo antes de comenzar la decodificación, y no existe EOS autorregresivo que detenga la generación.

El adaptador LoRA se entrenó sobre 200.000 pares WMT19 de-en (configuración `ende` del dataset Entropy-Valley-Datasets), durante 3 épocas, en precisión bf16, con 8 GPU H20. La decodificación usa el esquema MED (masked ELMo decoding) con T=32 pasos y truncamiento por EOS. La rejilla de longitudes candidatas de EV es fija para esta dirección: R = {1.50, 1.60, 1.70, 1.80, 1.90} multiplicadores sobre la longitud de la fuente. La plantilla de prompt es `Translate English to German.\n\nEnglish: {src}\nGerman: `.

La innovación técnica principal es el método Entropy-Valley en sí: un selector de longitud a tiempo de decodificación que evalúa cada longitud candidata mediante una única pasada forward con el canvas completamente enmascarado, puntuando por la entropía predictiva media sobre los primeros L−1 slots (el último se reserva para EOS), y seleccionando la longitud que minimiza la entropía. Este método no requiere entrenamiento adicional y es independiente del backbone.

## Capacidades

- Traducción automática inglés→alemán mediante decodificación por difusión enmascarada (no autorregresiva).
- Selección de longitud adaptativa a tiempo de decodificación: el modelo puede decidir la longitud del canvas objetivo sin necesidad de un oráculo de longitud.
- Decodificación con esquema MED (máscara en escalera) con 32 pasos y truncamiento por EOS.
- Compatible con las tres condiciones de decodificación del paper: longitud fija (ratio 1.8), Entropy-Valley y longitud oráculo.
- No soporta tool calling, visión, audio ni razonamiento general: es un adaptador de traducción exclusivamente.
- Capacidades multilingües limitadas a en→de (el mismo proyecto publica adaptadores En→Zh y Zh→En).

## Casos de uso

- **Traducción de contenido editorial y técnico En→De**: el modelo puede integrarse en pipelines de traducción para documentación técnica, manuales de producto o artículos, aprovechando que la decodificación por difusión produce salidas coherentes con control de longitud explícito.
- **Localización de software y UI**: la plantilla de prompt simple permite integrarse en flujos de localización donde se necesita traducir cadenas cortas y de longitud variable, con el selector EV ajustando automáticamente la longitud del canvas.
- **Investigación en modelos de difusión enmascarada para MT**: el adaptador y el método EV están diseñados para comparar la calidad de traducción de modelos de difusión frente a autorregresivos, siendo útil para experimentos académicos sobre decodificación adaptativa.
- **Traducción en tiempo real en sistemas de atención al cliente**: la decodificación con 32 pasos MED y la selección de longitud EV permiten traducir mensajes de usuarios con latencia controlable, aunque requiere GPU dedicada para la inferencia.
- **Pipeline de traducción con control de longitud**: al poder fijar la longitud del canvas de salida, el sistema es adecuado para escenarios donde el destino debe tener una longitud determinada (por ejemplo, subtítulos o doblaje con restricciones de tiempo).
- **Evaluación de métodos de decodificación**: el repositorio reproduce la evaluación completa de WMT22 (decodifica los tres métodos de longitud y puntúa con COMET y BLEU), útil para investigar la influencia de la selección de longitud en la calidad de la traducción.

## Benchmarks y rendimiento

Resultados en WMT22 En→De (N=2.037), con decodificación MED de 32 pasos, media de tres ejecuciones de entrenamiento independientes:

| Método de longitud | COMET-22 | sacreBLEU |
|---|---|---|
| Fixed ratio 1.8 | 0.7170 | 20.73 |
| **Entropy-Valley** | **0.7240** | **21.55** |
| Length oracle † | 0.7382 | 22.55 |

† El oráculo de longitud decodifica con la longitud de referencia — es un límite superior, no un método desplegable. EV cierra el **33.0 %** de la distancia entre el fixed ratio y el oráculo.

El paper reporta pruebas de significancia, resultados cross-backbone y ablaciones completas. La dirección En→De es la de menor ganancia del proyecto; las direcciones En→Zh y Zh→En muestran mejores resultados (EV cierra el 65.3 % de la distancia en Zh→En).

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo base en bf16 ocupa aproximadamente 16 GB, más el adaptador LoRA fusionado (0.6 GB de repositorio). Con cuantización a 8 bits podría reducirse a ~8–10 GB, aunque no se han publicado guías de cuantización específicas.
- **GPU recomendadas**: para inferencia en bf16, una GPU con 24 GB de VRAM (RTX 3090/4090, A5000) es suficiente; para entrenamiento se usaron 8×H20 (NVIDIA H20, variante del H100 para el mercado chino).
- **En consumer GPU**: sí, es viable en GPUs de consumo con 24 GB (RTX 4090) en bf16, y con cuantización en GPUs de 16 GB.
- **Opciones de despliegue**: el adaptador se usa con HuggingFace Transformers + PEFT (PeftModel) + la librería `ladit` del repositorio Entropy-Valley. No se menciona soporte en vLLM, llama.cpp u Ollama, ya que la decodificación por difusión enmascarada requiere el pipeline de decodificación específico de `ladit`.
- **Latencia y throughput**: no disponible. La decodificación con 32 pasos MED implica múltiples pasadas forward sobre el canvas, por lo que la latencia es mayor que la de un modelo autorregresivo equivalente; el paper no reporta métricas de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Dirección | Método | COMET-22 | sacreBLEU | Licencia |
|---|---|---|---|---|---|
| Entropy-Valley-LLaDA-8B-En2De | En→De | EV + LLaDA-8B | 0.7240 | 21.55 | llada-8b-base-license |
| Entropy-Valley-LLaDA-8B-En2Zh | En→Zh | EV + LLaDA-8B | No disponible | No disponible | llada-8b-base-license |
| Entropy-Valley-LLaDA-8B-Zh2En | Zh→En | EV + LLaDA-8B | No disponible | No disponible | llada-8b-base-license |

Nota: las métricas COMET/BLEU de los adaptadores En→Zh y Zh→En no se reportan en la información disponible, pero el proyecto indica que EV cierra el 65.3 % de la distancia en Zh→En, significativamente más que el 33.0 % de En→De. No se dispone de datos comparables de modelos de traducción autorregresivos (NLLB, M2M-100) en la información proporcionada.

## Limitaciones y advertencias

- **Dirección de menor soporte**: En→De es la comprobación "matched-scale" del paper, no su dirección principal. Las ganancias son menores que en En→Zh y Zh→En, y el paper documenta por qué.
- **El adaptador no es el método**: Entropy-Valley es un selector de longitud a tiempo de decodificación; el adaptador es el backbone fijo que EV decodifica. No se puede usar el adaptador sin el pipeline de decodificación de `ladit`.
- **No es un modelo general**: está limitado a traducción inglés→alemán; no soporta otras tareas, ni tool calling, ni razonamiento general.
- **Riesgo de alucinación**: como todos los modelos de difusión enmascarada, puede producir contenido fluido pero incorrecto si la longitud del canvas se elige mal; la evaluación con EV reduce este riesgo pero no lo elimina.
- **Licencia**: el modelo usa la licencia `llada-8b-base-license` del modelo base, que puede tener restricciones para uso comercial; es necesario revisar los términos en el repositorio de GSAI-ML/LLaDA-8B-Base.
- **Sesgos**: no se han documentado sesgos específicos del adaptador, pero el modelo base LLaDA puede heredar sesgos de sus datos de pre-entrenamiento; no se proporcionan evaluaciones de sesgo en la información disponible.
- **Cuantización**: no se han publicado configuraciones de cuantización probadas; el uso en producción con cuantización requeriría validación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YanZhanPKU/Entropy-Valley-LLaDA-8B-En2De
- Colección Entropy-Valley: https://huggingface.co/collections/YanZhanPKU/entropy-valley
- Dataset Entropy-Valley-Datasets: https://huggingface.co/datasets/YanZhanPKU/Entropy-Valley-Datasets
- Paper arXiv: https://arxiv.org/abs/2608.22274
- Código en GitHub: https://github.com/Entropy-Valley/Entropy-Valley
- Paper LLaDA (modelo base): https://arxiv.org/abs/2502.09992
- Modelo base GSAI-ML/LLaDA-8B-Base: https://huggingface.co/GSAI-ML/LLaDA-8B-Base
- Adaptadores relacionados: https://huggingface.co/YanZhanPKU/Entropy-Valley-LLaDA-8B-En2Zh y https://huggingface.co/YanZhanPKU/Entropy-Valley-LLaDA-8B-Zh2En
