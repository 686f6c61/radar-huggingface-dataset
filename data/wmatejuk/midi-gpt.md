# wmatejuk/midi-gpt

## Resumen

midi-gpt es una colección de checkpoints de modelos de lenguaje GPT-2 entrenados por el usuario wmatejuk sobre datos MIDI, publicados como parte de un estudio de leyes de escala (scaling laws) en el dominio de la música simbólica. El repositorio no contiene un modelo único, sino múltiples ejecuciones identificadas por la nomenclatura `{presupuesto_computacional}-{anchura}`, por ejemplo `C3e15-d64`, donde cada subcarpeta corresponde a una combinación concreta de cómputo (FLOPs) y tamaño de modelo (dimensión del hidden state).

El objetivo declarado es verificar empíricamente las leyes IsoFLOP en modelos de lenguaje aplicados a MIDI: cada subcarpeta almacena un `summary.json` con el número de parámetros (N), tokens de entrenamiento (D), FLOPs empleados y la pérdida de validación, lo que permite trazar curvas de escalado y comparar configuraciones bajo un mismo presupuesto de cómputo. La tokenización no es textual sino que se realiza mediante un codec MIDI propio, documentado en `midi_codec.json` dentro de cada subcarpeta.

Se trata de un artefacto de investigación más que de un modelo listo para producción: no hay model card con detalles de entrenamiento, licencia, idiomas ni resultados de benchmarks, y el número de descargas es cero en el momento de la consulta. Su interés es principalmente metodológico para quienes estudian scaling laws en dominios no textuales o entrenan modelos generativos de música simbólica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), según tag `gpt2` |
| Parametros totales | Variable por subcarpeta; documentado en `summary.json` (N). No disponible en la información proporcionada |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; pesos publicados en safetensors (sin GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | No disponible (dominio MIDI, no texto natural) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Cada checkpoint sigue la arquitectura GPT-2 (transformer decoder-only con atención causal), parametrizada por una anchura `d` indicada en el nombre de la subcarpeta (por ejemplo, `d64`). El repositorio organiza las ejecuciones como pares `(presupuesto de cómputo, tamaño de modelo)` para un barrido IsoFLOP: distintas anchuras se entrenan bajo presupuestos de FLOPs fijos, lo que permite ajustar la frontera de óptimo computacional en el dominio MIDI.

Los datos de entrada son secuencias de tokens MIDI generadas por un codec propio, cuyo esquema se describe en `midi_codec.json`. Cada subcarpeta incluye `summary.json` con N (parámetros), D (tokens vistos), FLOPs y pérdida de validación, lo que constituye la evidencia empírica del estudio de escalado. No se documentan en la información disponible el número total de tokens, la composición del corpus MIDI, ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se describen innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de secuencias de tokens MIDI a partir de un contexto previo, mediante `AutoModelForCausalLM` con el tokenizador asociado a cada subcarpeta.
- Modelado de lenguaje autoregresivo sobre el vocabulario definido por el codec MIDI del autor.
- Sirve como banco de pruebas para análisis de scaling laws: comparación de pérdida de validación frente a FLOPs, parámetros y tokens.
- No hay evidencia de soporte de tool calling, function calling ni agentes multi-paso.
- No hay evidencia de capacidades multilingües en texto natural, visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documentan capacidades de instrucción, chat ni alineación.

## Casos de uso

- Estudio de scaling laws en música simbólica: cargar varias subcarpetas y ajustar curvas de pérdida frente a FLOPs para reproducir o contrastar la frontera IsoFLOP del autor, usando los valores de `summary.json` como referencia.
- Investigación sobre tokenización MIDI: analizar `midi_codec.json` para entender cómo se codifican notas, duraciones y eventos, y evaluar el impacto del esquema de tokenización en la pérdida.
- Generación de continuaciones MIDI en experimentos controlados: dado un prefijo tokenizado con el codec del autor, muestrear secuencias para inspección cualitativa, asumiendo que la calidad será la de un modelo pequeño de investigación.
- Baseline para comparativas de modelos musicales: emplear los checkpoints como referencia de pérdida de validación frente a modelos propios del mismo dominio y presupuesto de cómputo.
- Reproducibilidad de experimentos: el par `summary.json` + safetensors permite recalcular métricas y verificar los números reportados por el autor sin reentrenar.
- Docencia y formación: ejemplo didáctico de cómo estructurar un barrido IsoFLOP en un dominio no textual, con artefactos separados por configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye pérdidas de validación por ejecución en `summary.json`, sin tabla comparativa pública ni métricas estándar (MMLU, HumanEval, GSM8K) que además no aplicarían a un modelo de dominio MIDI.

## Requisitos de hardware

- VRAM estimada: depende de la anchura `d` de la subcarpeta. Para un GPT-2 pequeño (decenas de millones de parámetros) bastan unos pocos GB en fp32; para las variantes más anchas del barrido la cifra exacta no está disponible en la información proporcionada.
- GPU recomendadas: no disponible. Por el tamaño del repo (3,6 GB para el conjunto de checkpoints) es plausible que las ejecuciones individuales quepan en GPUs consumer, pero no se confirma.
- Cabe en GPU consumer: no confirmado; probable en las variantes pequeñas del barrido, no verificable sin los valores de N de cada `summary.json`.
- Opciones de despliegue: transformers (carga nativa con `subfolder`); vLLM, llama.cpp, Ollama o TGI no están documentados para este repositorio y requerirían conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| midi-gpt (wmatejuk) | Variable por subcarpeta (N en `summary.json`) | No disponible | MIDI simbólico | No disponible | Hugging Face, 0 descargas |
| Modelos GPT-2 originales (OpenAI) | 124M / 355M / 774M / 1.5B | 1024 tokens | Texto natural | MIT (pesos publicados) | Amplia |
| Alternativas de generación MIDI open source | No disponible | No disponible | MIDI simbólico | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables del mismo dominio con métricas públicas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Artefacto de investigación: no hay model card con detalles de entrenamiento, datos, sesgos ni evaluación de calidad; no debe tratarse como modelo listo para producción.
- Licencia no especificada: la ausencia de licencia impide asumir permiso para uso comercial; hay que contactar con el autor antes de cualquier despliegue.
- Idiomas y contexto no documentados: se desconoce la longitud de contexto efectiva y el vocabulario exacto más allá de lo que indique el codec.
- Riesgo de alucinación: como modelo autoregresivo de dominio, puede generar secuencias MIDI musicalmente incoherentes o inválidas según el codec; no hay evaluación publicada.
- Sin cuantizaciones publicadas: solo safetensors en transformers; el despliegue en llama.cpp u Ollama requeriría conversión y validación propias.
- Trazabilidad limitada: el nombre de la subcarpeta codifica presupuesto y anchura, pero sin leer `summary.json` no se conocen N, D ni la pérdida de validación de cada ejecución.
- Advertencia de seguridad: al ser un repositorio de un autor individual sin revisión, conviene auditar los archivos antes de cargarlos en entornos con `trust_remote_code`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wmatejuk/midi-gpt
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales asociados al modelo.
