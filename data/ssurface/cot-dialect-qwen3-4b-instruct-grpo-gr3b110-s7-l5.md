# ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3b110-s7-l5

## Resumen

Este repositorio contiene un adaptador LoRA de investigación denominado `cot-dialect-qwen3-4b-instruct-grpo-gr3b110-s7-l5`, desarrollado por el autor ssurface como parte de un estudio sobre compresión de cadenas de razonamiento (chain-of-thought). El adaptador se apila sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` y lo entrena para razonar en un "dialecto" de nivel L5, es decir, expresar el razonamiento matemático como una única expresión colapsada de muy pocos caracteres (mediana de 16 caracteres dentro de la etiqueta `thinking`).

Se trata de una **ablación explícita**: el autor publica este adaptador para que la comparación de diseños de recompensa del paper "Chain-of-Thought Compression Dialects" pueda reproducirse de forma independiente. No es uno de los modelos principales de la familia; el modelo principal para este nivel es `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5`. El entrenamiento utiliza GRPO (con loss tipo DAPO) sobre un modelo SFT previo a nivel L5, con un conjunto de recompensas que combina corrección, formato, verificación aritmética de la cadena y un factor de escala por longitud.

La relevancia de este modelo reside en su valor como herramienta de investigación: permite estudiar cómo la compresión extrema del razonamiento afecta a la precisión, y cómo distintas funciones de recompensa influyen en el resultado final. No está pensado para uso en producción, sino para reproducir experimentos y analizar el comportamiento de la compresión de CoT en modelos pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre transformer denso `Qwen/Qwen3-4B-Instruct-2507` |
| Parametros totales | 4B (modelo base) + adaptador LoRA (tamano del repo: 0.1 GB; numero exacto de parametros del adaptador no disponible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la informacion) |
| Tipos de cuantizacion | bf16 (usado en entrenamiento e inferencia); no se documentan cuantizaciones especificas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con GRPO (Group Relative Policy Optimization) usando la implementación `trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa`. El modelo base es `Qwen/Qwen3-4B-Instruct-2507`, un transformer denso de 4B parámetros. El entrenamiento se realiza sobre el modelo SFT fusionado a nivel L5 (`merged_new_fixed/l5`), no sobre el modelo base sin ajustar; por tanto, el adaptador debe apilarse después de cargar el adaptador SFT correspondiente.

El conjunto de datos de entrenamiento es GSM8K train re-expresado a nivel L5 por un modelo profesor, con 6993 ejemplos y una mediana de longitud de cadena de 16 caracteres. La función de recompensa combina cuatro componentes: `correctness` (basada en coincidencia con la respuesta dorada, ponderada por el número de pasos), `format` (exige un bloque `thinking...response` seguido de `#### <answer>`), `chain` (verificador aritmético de la cadena) y `gr3` (reescalado multiplicativo de recompensas positivas, con suelo en 0.3). Se usan 8 generaciones por prompt, batch de 16 con acumulación de gradientes de 2, máximo de 256 tokens de completación, learning rate de 1e-05 y coeficiente KL (beta) de 0.0. El entrenamiento se realizó en una NVIDIA A100 80GB.

Una nota técnica relevante: el autor advierte que el uso de kernels fusionados produjo adaptadores con matrices `lora_B` todas a cero, matemáticamente inertes. Todos los adaptadores publicados fueron verificados con `lora_B != 0`; 13 que fallaron esa comprobación fueron retenidos.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento extremadamente comprimidas (nivel L5): el modelo produce una única expresión colapsada, por ejemplo `18/3*2=12`, en lugar de un razonamiento paso a paso extenso.
- Generación de texto en inglés, con formato de respuesta estructurado (`thinking`, `response`, `#### <answer>`).
- Capacidad de verificación aritmética interna: el componente de recompensa `chain` valida que las operaciones escritas en la cadena sean correctas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multimodalidad.

## Casos de uso

- Reproducción de experimentos de ablación: permite replicar la comparación de diseños de recompensa del paper "Chain-of-Thought Compression Dialects" sin depender de la palabra del autor, ejecutando la misma configuración de entrenamiento.
- Investigación sobre compresión de razonamiento: estudiar cómo la reducción drástica de la longitud de la cadena de pensamiento (de 532 caracteres en L1 a 16 en L5) afecta a la precisión en problemas aritméticos.
- Análisis de la interacción entre SFT y GRPO: al requerir la carga secuencial del adaptador SFT y luego el adaptador GRPO, permite aislar la contribución de cada fase de entrenamiento.
- Evaluación de la degradación por dificultad: medir cómo cae la precisión con problemas más complejos cuando el razonamiento está comprimido al extremo.
- Comparación de funciones de recompensa: usar este adaptador como punto de referencia frente al modelo principal L5 para cuantificar el efecto del componente `gr3` (reescalado de recompensas positivas).
- Estudio de robustez estadística: con un tamaño de muestra de 1317 ejemplos y un intervalo de confianza del 95% con semianchura de ~2.7 puntos porcentuales, sirve para calibrar la significancia de diferencias entre variantes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| GSM8K (test, n=1317) | Accuracy (exact match) | 71.8% |

Condiciones de evaluación: decodificación greedy, una sola vuelta, sin ejemplos y sin self-consistency. El autor advierte que la precisión cae con la dificultad del problema, de forma más acusada en los niveles comprimidos, y que diferencias de un par de puntos porcentuales están dentro del ruido estadístico.

No se han publicado resultados de benchmarks en la informacion disponible para el modelo base `Qwen/Qwen3-4B-Instruct-2507` ni para otros adaptadores de la misma familia.

## Requisitos de hardware

- Inferencia: el modelo base en bf16 requiere aproximadamente 8 GB de VRAM (4B parámetros x 2 bytes). Con cuantización de 4 bits, el requisito baja a ~2.5 GB, aunque no se documentan cuantizaciones específicas para este adaptador.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060, RTX 4070) es suficiente para inferencia en bf16. Para entrenamiento se usó una NVIDIA A100 80GB.
- El adaptador LoRA añade una sobrecarga mínima de memoria y cómputo.
- Opciones de despliegue: `transformers` con `peft` (carga secuencial de adaptadores), compatible con `vLLM` si se fusionan los adaptadores, y potencialmente con `llama.cpp` si se convierte el modelo fusionado a GGUF (no documentado).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | GSM8K (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `cot-dialect-qwen3-4b-instruct-grpo-gr3b110-s7-l5` (este) | Adaptador LoRA (ablacion) | 4B base + LoRA | No disponible | 71.8% | Apache 2.0 | HF |
| `cot-dialect-qwen3-4b-instruct-grpo-l5` | Adaptador LoRA (modelo principal L5) | 4B base + LoRA | No disponible | No disponible | Apache 2.0 | HF |
| `Qwen/Qwen3-4B-Instruct-2507` | Modelo base | 4B | No disponible | No disponible | Apache 2.0 | HF |

La comparativa es limitada porque no se dispone de resultados de benchmarks para el modelo base ni para el adaptador principal L5 en la informacion proporcionada. La diferencia clave con el modelo base es que este adaptador fuerza un razonamiento comprimido a nivel L5, mientras que el base genera cadenas de pensamiento extensas por defecto. Frente al adaptador principal L5, este es una ablación entrenada con una recompensa distinta (incluye `gr3`) y puede presentar un rendimiento inferior por diseño.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matemáticas con palabras (GSM8K); no hay evidencia de generalización a otros dominios.
- La precisión cae con la dificultad del problema, de forma más acusada en los niveles comprimidos como L5.
- Es una ablación: fue entrenado para responder a una pregunta concreta sobre diseño de recompensas y puede ser peor que el modelo principal del mismo nivel.
- Requiere cargar primero el adaptador SFT (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`) y fusionarlo antes de aplicar este adaptador; cargarlo directamente sobre el modelo base no reproduce el resultado reportado.
- El resultado de 71.8% proviene de una sola semilla; diferencias de un par de puntos porcentuales están dentro del ruido estadístico (semianchura del 95% de ~2.7 pp con n=1317).
- No está diseñado para uso en producción: es una herramienta de investigación con fines de reproducibilidad.
- Solo soporta inglés como idioma de entrada/salida documentado.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3b110-s7-l5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Adaptador SFT previo (requerido): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l5
- Paper citado: "Chain-of-Thought Compression Dialects" (Frolov, Anatolii, 2026) — referencia bibliografica incluida en la model card, sin enlace directo disponible.
