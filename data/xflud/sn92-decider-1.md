# xflud/sn92-decider-1

## Resumen

sn92-decider-1 es un ajuste fino (fine-tune) del modelo base baselabs/mammoth-1, publicado por el usuario xflud en Hugging Face. El modelo está orientado a la pista "generalist" de REAX, el subnet 92 de la red Bittensor, una infraestructura descentralizada de incentivos para el entrenamiento y la inferencia de modelos de IA. La model card es extremadamente escueta: apenas confirma la relación de fine-tune sobre la revisión 61cec44c del modelo base y declara licencia MIT.

El repositorio contiene pesos en formato safetensors con un total de 26.085.330.160 parámetros (aproximadamente 26.000 millones), lo que sitúa al modelo en la categoría de modelos densos de gran tamano. El tag `qwen3_5` sugiere que la arquitectura subyacente deriva de la familia Qwen, aunque no se proporciona confirmación explícita en la información disponible.

La relevancia de este modelo es acotada: se trata de un checkpoint de competición dentro de un subnet de Bittensor, sin documentación técnica publicada, sin benchmarks y sin especificación de contexto o idiomas. Resulta útil principalmente para quienes participan en el ecosistema REAX o quieren inspeccionar fine-tunes derivados de mammoth-1, pero no como modelo de propósito general para producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5` sugiere base tipo Qwen, sin confirmar) |
| Parametros totales | 26.085.330.160 (aprox. 26 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo más allá del tag `qwen3_5` incluido en el repositorio, que apunta a una base de la familia Qwen. El modelo es un fine-tune de baselabs/mammoth-1 (revisión 61cec44c) orientado a la pista generalist de REAX (Bittensor subnet 92). No se detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

Tampoco se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa, mezcla de expertos u otras). El tamano del repositorio (52,2 GB) es coherente con pesos en precisión de 16 bits para 26.000 millones de parámetros, lo que sugiere que no se publicaron variantes cuantizadas junto al checkpoint principal.

## Capacidades

- Generación de texto y modelado de lenguaje general, heredadas del modelo base mammoth-1 (no verificadas de forma independiente en la información disponible).
- Orientación declarada a tareas de tipo "generalist" dentro del entorno de evaluación de REAX, sin especificación de qué tareas concretas cubre.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Participación en el subnet 92 de Bittensor (REAX): el modelo está entrenado específicamente para la pista generalist de esta competición, por lo que su uso natural es servir como checkpoint candidato en las evaluaciones del subnet.
- Investigación sobre fine-tunes derivados de mammoth-1: permite comparar el efecto del ajuste fino sobre el modelo base en un entorno controlado, siempre que se disponga de acceso a baselabs/mammoth-1 para la comparación.
- Experimentación con modelos de ~26 B parámetros en formato safetensors: útil para estudiar requisitos de memoria y estrategias de despliegue en precisión completa o semi-precisión.
- Base para ajustes finos posteriores: al estar bajo licencia MIT, puede servir como punto de partida para fine-tunes propios, aunque sin garantías documentadas de calidad.
- Evaluación interna de robustez y sesgos: dado que no hay benchmarks publicados, un equipo puede usar el modelo como sujeto de pruebas en su propio arnés de evaluación.
- Reproducción de pipelines de la comunidad Bittensor: para quienes replican flujos de entrenamiento e inferencia del ecosistema REAX, el checkpoint permite validar la cadena base → fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 52 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 60-80 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 26-30 GB de pesos, con overhead adicional; requiere GPUs de 40-48 GB para margen cómodo.
- VRAM estimada en cuantización de 4 bits: aproximadamente 13-15 GB de pesos; podría caber en una RTX 4090 (24 GB) con contexto limitado, aunque no se han publicado pesos GGUF oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para precisión completa; A6000 / L40S (48 GB) para 8 bits; RTX 4090 solo con cuantización agresiva.
- Opciones de despliegue: vLLM, TGI o transformers para pesos safetensors; llama.cpp u Ollama requerirían conversión propia a GGUF, no disponible en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| xflud/sn92-decider-1 | ~26 B | no disponible | MIT | Hugging Face (174 descargas) | Fine-tune para REAX subnet 92; sin benchmarks |
| baselabs/mammoth-1 | no disponible en la informacion proporcionada | no disponible | no disponible | Hugging Face | Modelo base del que deriva este checkpoint |
| Qwen2.5-32B | ~32 B | 128 K (según documentación pública de Qwen) | Apache 2.0 (según documentación pública) | Hugging Face | Alternativa densa de tamano similar; datos no verificados en esta ficha |

La comparación con la familia Qwen se incluye solo como referencia de categoria por el tag `qwen3_5`; no se dispone de datos verificados de rendimiento para sn92-decider-1 que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia documentada de calidad en tareas estándar (MMLU, HumanEval, GSM8K u otras).
- Model card mínima: no se especifican contexto, idiomas, datos de entrenamiento ni procedimiento de ajuste, lo que dificulta evaluar riesgos de sesgo y alucinación.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamano; sin evaluaciones publicadas no puede acotarse.
- Sesgos conocidos: no documentados; al desconocerse la composición del dataset de ajuste, no es posible estimarlos.
- Limitaciones de contexto e idioma: no disponibles; no debe asumirse soporte multilingüe ni ventanas largas.
- Uso comercial: la licencia MIT permite uso comercial, pero el autor no ofrece garantías ni documentación de conformidad; conviene revisar el archivo NOTICE y los términos del modelo base mammoth-1 antes de desplegar.
- Naturaleza de competición: al ser un checkpoint orientado a un subnet de Bittensor, su ajuste puede estar sobreoptimizado para las métricas de ese entorno y generalizar mal fuera de él.
- Sin cuantizaciones oficiales: desplegarlo en hardware consumer exige convertir los pesos a GGUF o cuantizar por cuenta propia, con riesgo de degradación no medida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xflud/sn92-decider-1
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Bittensor (red): https://bittensor.com
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
