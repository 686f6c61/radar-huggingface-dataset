# XinjieZhang/MAS-BIT

## Resumen

MAS-BIT es un sistema multiagente para decodificación end-to-end de cerebro a texto (brain-to-text), desarrollado por XinjieZhang. Decodifica frases a partir de actividad neuronal intracortical empleando tres agentes de lenguaje que comparten el decodificador de texto Qwen3-ASR-1.7B: un *experto neuronal* que lee representaciones continuas del encoder, un *experto fonético* que lee posteriores de fonemas y un *árbitro* que combina sus mensajes latentes con evidencia neuronal directa para producir la frase final.

El modelo se entrena de forma conjunta sobre los participantes T12 (Brain-to-Text '24) y T15 (Brain-to-Text '25) y decodifica de forma greedy, sin léxico, sin modelo de n-gramas ni reranker externo de lenguaje. El checkpoint liberado (184 MB) contiene únicamente los encoders neuronales, los readouts de fonemas, el proyector neuronal, los embeddings de fonema y de rol, y los adaptadores LoRA de los tres agentes; los pesos de Qwen3-ASR-1.7B se descargan por separado.

Es relevante porque demuestra que un sistema multiagente ligero, apoyado en un decodificador ASR de 1.7B parámetros, puede alcanzar tasas de error de palabra (WER) por debajo del 4 % en el benchmark Brain-to-Text '25 sin depender de modelos de lenguaje externos, un resultado competitivo en el estado del arte de interfaces cerebro-computadora (BCI) para habla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema multiagente sobre decodificador transformer Qwen3-ASR-1.7B con adaptadores LoRA; encoders neuronales y readouts de fonemas propios |
| Parámetros totales | No disponible (checkpoint liberado de 184 MB; el decodificador base Qwen3-ASR-1.7B se descarga aparte) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el checkpoint se publica en safetensors; inferencia en precisión simple según la model card) |
| Idiomas soportados | No disponible (los benchmarks Brain-to-Text son en inglés, pero no se declara formalmente) |
| Licencia | MIT |
| Formato de pesos | safetensors (`mas_bit.safetensors`, 184 MB; `init.safetensors`, 61 MB) |

## Arquitectura y entrenamiento

MAS-BIT es un sistema multiagente compuesto por tres agentes que comparten el decodificador de texto Qwen3-ASR-1.7B mediante adaptadores LoRA. El *experto neuronal* consume representaciones continuas del encoder neuronal; el *experto fonético* consume posteriores de fonemas; y el *árbitro* integra los mensajes latentes de ambos junto con evidencia neuronal directa para generar la frase. El checkpoint incluye encoders neuronales, readouts de fonemas, un proyector neuronal, embeddings de fonema y de rol, y los LoRA de los tres agentes.

El entrenamiento se realiza de forma conjunta sobre dos participantes de interfaces intracorticales: T12 (Brain-to-Text '24) y T15 (Brain-to-Text '25). El fichero `init.safetensors` contiene los pesos iniciales del entrenamiento, correspondientes a los encoders neuronales y readouts de fonemas de los checkpoints BIT liberados de T12 y T15. La decodificación es greedy y prescinde de léxico, modelo de n-gramas y reranker externo de lenguaje, lo que constituye la innovación principal frente a pipelines clásicos de decodificación de habla desde señales neuronales. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Decodificación de frases completas a partir de actividad neuronal intracortical (brain-to-text).
- Decodificación sin léxico, sin modelo de n-gramas y sin reranker externo de lenguaje.
- Decodificación greedy en precisión simple.
- Integración multiagente con roles diferenciados (experto neuronal, experto fonético, árbitro).
- Entrenamiento conjunto multi-participante (T12 y T15).
- No se documentan capacidades de tool calling, agentes de propósito general, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Decodificación de habla asistida para personas con parálisis severa: el sistema traduce la actividad intracortical en texto, permitiendo comunicación escrita a usuarios con implantes de electrocorticografía o arrays intracorticales, aprovechando que decodifica sin léxico ni reranker externo.
- Investigación en neuroprótesis del habla: sirve como línea base reproducible para comparar arquitecturas multiagente frente a pipelines con modelo de lenguaje externo, usando los formatos de submission de Brain-to-Text '24 y '25.
- Evaluación de generalización entre participantes: al entrenarse conjuntamente sobre T12 y T15, permite estudiar la transferencia de representaciones neuronales entre sujetos y sesiones.
- Desarrollo de decodificadores de fonemas: los readouts de fonemas y el experto fonético pueden reutilizarse como componente en sistemas que necesiten posteriores fonéticos a partir de señal neuronal.
- Reproducción de resultados académicos: el script `eval.py` genera directamente `t12_holdout.txt` y `t15_holdout.csv`, los formatos de submission de ambos benchmarks, facilitando la verificación independiente del WER publicado.
- Integración en pipelines de investigación BCI: el checkpoint ligero (184 MB) más el decodificador Qwen3-ASR-1.7B permite desplegar el sistema en entornos de laboratorio con recursos moderados frente a modelos de lenguaje de mayor tamaño.

## Benchmarks y rendimiento

Resultados publicados en la model card (WER en holdout, decodificación greedy en precisión simple):

| Benchmark | Holdout WER |
|---|---|
| Brain-to-Text '24 (T12) | 6,929 % |
| Brain-to-Text '25 (T15), leaderboard público | 3,606 % |
| Brain-to-Text '25 (T15), leaderboard privado | 3,892 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint propio ocupa 184 MB y requiere además cargar Qwen3-ASR-1.7B, por lo que el consumo vendrá dominado por el decodificador base.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del decodificador base (1.7B) es plausible en GPUs de consumo con memoria suficiente, pero no se confirma en la información proporcionada.
- Opciones de despliegue: el repositorio de código oficial (`eval.py`) con el entorno propio, la carpeta de datos y `weights/Qwen3-ASR-1.7B`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de decodificación brain-to-text con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Requiere datos de actividad neuronal intracortical; no es un modelo de texto de propósito general.
- Depende de los encoders neuronales y readouts de fonemas específicos de los participantes T12 y T15; el rendimiento en otros sujetos o configuraciones de implante no está documentado.
- Los resultados publicados corresponden a WER en holdout de dos benchmarks concretos; no hay evidencia de generalización fuera de ellos.
- No se documentan sesgos, riesgos de alucinación ni comportamiento multilingüe.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3-ASR-1.7B se distribuye por separado y queda sujeto a su propia licencia.
- El checkpoint no incluye los pesos de Qwen3-ASR-1.7B; es necesario descargarlos aparte para la inferencia.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XinjieZhang/MAS-BIT
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Paper: https://arxiv.org/abs/2611.29457
- Código: https://github.com/BaochaiXue/Multi_Agent_System_for_BraIn_to_Text
