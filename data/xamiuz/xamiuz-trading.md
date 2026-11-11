# xamiuz/xamiuz-trading

## Resumen

Xamiuz Trading 1.0 es un ajuste fino (fine-tuning) supervisado del modelo Qwen2.5-Coder-1.5B-Instruct, orientado al dominio de trading cuantitativo, Forex y programación MQL5/MQL4 para MetaTrader 5. Lo desarrolla el usuario xamiuz y se publica bajo licencia Apache 2.0. El modelo se presenta como una "preview de desarrollo activo" y busca resolver tareas de generación de Expert Advisors, indicadores personalizados, gestión de riesgo y análisis de mercado basado en Smart Money Concepts (BOS, CHoCH, Order Block, FVG) y price action.

El modelo hereda la arquitectura y el tamaño del Qwen2.5-Coder-1.5B-Instruct original: un transformer decoder-only de aproximadamente 1.500 millones de parámetros, con una ventana de contexto que el modelo base sitúa en 32.768 tokens (dato del modelo base, no verificado en la model card del ajuste). El ajuste se ha realizado mediante SFT sobre un dataset propio en formato JSONL, cuyo pipeline se documenta en un notebook de Google Colab incluido en el repositorio.

Su relevancia es acotada: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks publicados. Resulta útil como ejemplo de especialización de un modelo pequeño de código en un dominio vertical (MQL5/MetaTrader) y como base para experimentación, pero no dispone de evidencia empírica de calidad que respalde su uso en producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-1.5B-Instruct) |
| Parámetros totales | Aproximadamente 1.500 millones (modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card del ajuste; el modelo base Qwen2.5-Coder-1.5B-Instruct declara 32.768 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Indonesio (id) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio incluye notebook de Colab y dataset SFT en JSONL, pero no se detalla el formato de pesos) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de aproximadamente 1.500 millones de parámetros especializado en código. El ajuste se realiza mediante SFT (supervised fine-tuning) sobre un dataset propio publicado en el repositorio como `dataset/xamiuz_trading_sft_full.jsonl`, con un pipeline reproducible documentado en `colab_xamiuz_trading_pipeline.ipynb`. No se especifican en la model card el número de tokens de entrenamiento, la composición exacta del dataset, la mezcla de datos ni si se aplicaron técnicas de RLHF o DPO.

Las innovaciones técnicas declaradas no van más allá de la especialización de dominio: el modelo se enfoca en cuatro áreas concretas (programación MQL5/MQL4, gestión de riesgo, análisis de mercado con Smart Money Concepts y evaluación de posiciones abiertas en MetaTrader 5). No se documentan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas. Al tratarse de un fine-tuning sobre un modelo base de 1.5B, hereda las capacidades y limitaciones del Qwen2.5-Coder original, incluyendo su tokenizador y su ventana de contexto.

## Capacidades

- Generación de texto técnico en el dominio de trading, Forex y criptomonedas.
- Programación MQL5 y MQL4: generación de Expert Advisors (EA), trailing stops, indicadores personalizados y lógica de ejecución de órdenes.
- Gestión de riesgo: cálculo de tamaño de lote, pips, spread, nivel de margen y slippage.
- Análisis de mercado basado en Smart Money Concepts: identificación de BOS (Break of Structure), CHoCH (Change of Character), Order Blocks y FVG (Fair Value Gaps).
- Análisis de price action y patrones de velas japonesas.
- Evaluación de posiciones abiertas en la terminal MetaTrader 5.
- Capacidades multilingües limitadas a indonesio e inglés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Generación de Expert Advisors en MQL5: el modelo puede producir esqueletos de EA con lógica de entrada, salida y gestión de riesgo, adecuado para prototipado rápido en MetaEditor antes de revisión manual.
- Creación de indicadores personalizados: útil para generar código de indicadores que detecten Order Blocks o FVG a partir de la lógica descrita por el usuario, dado el enfoque del dataset en Smart Money Concepts.
- Cálculo de tamaño de posición y gestión de riesgo: el modelo puede generar funciones MQL5 que calculen lotes en función del balance, el riesgo porcentual, el stop loss en pips y el valor del tick.
- Asistencia en análisis de price action: generación de explicaciones textuales sobre estructuras de mercado (BOS, CHoCH) para documentación o formación, siempre con verificación humana.
- Automatización de scripts de evaluación de posiciones: el modelo puede redactar scripts que consulten posiciones abiertas en MT5 y generen informes de exposición y margen.
- Soporte educativo en programación MQL5: útil como asistente para desarrolladores que aprenden MetaTrader 5, dado que el modelo base es de código y el ajuste refuerza el vocabulario del dominio.
- Prototipado de estrategias cuantitativas: generación de pseudocódigo o código MQL5 a partir de una descripción en lenguaje natural de la estrategia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Para un modelo de aproximadamente 1.5B parámetros, las estimaciones orientativas serían del orden de 3-4 GB en FP16 y 1-2 GB en cuantizaciones de 4 bits, aunque estas cifras no las proporciona el autor.
- GPU recomendadas: no disponible. Por tamaño, un modelo de 1.5B puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Probablemente sí por el tamaño del modelo base, pero no se documenta en la model card.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la documentación.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Xamiuz Trading 1.0 | ~1.5B | No disponible (base: 32.768) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning de nicho en MQL5/trading |
| Qwen2.5-Coder-1.5B-Instruct | ~1.5B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, capacidades generales de código |
| Qwen2.5-Coder-7B-Instruct | ~7B | 32.768 | Apache 2.0 | Hugging Face | Mayor capacidad, requiere más VRAM |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks publicados: no existe evidencia empírica de que el ajuste mejore al modelo base en tareas de trading o MQL5.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar código MQL5 sintácticamente plausible pero incorrecto, con funciones inexistentes o lógica de trading defectuosa.
- Idiomas limitados: solo indonesio e inglés; no se declara soporte de español.
- Ventana de contexto no confirmada en el ajuste: aunque el modelo base soporta 32.768 tokens, no se verifica que el fine-tuning preserve esa capacidad.
- Estado "preview de desarrollo activo": el autor lo presenta como trabajo en curso, sin garantías de estabilidad.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Uso en producción: requiere evaluación propia y revisión humana del código generado antes de ejecutarlo en cuentas reales de trading.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad del código generado y de las pérdidas financieras derivadas.
- Sin documentación de seguridad, sesgos ni evaluación de riesgos financieros.

## Enlaces

- Hugging Face: https://huggingface.co/xamiuz/xamiuz-trading
- Notebook del pipeline: https://huggingface.co/xamiuz/xamiuz-trading/blob/main/colab_xamiuz_trading_pipeline.ipynb
- Dataset SFT: https://huggingface.co/xamiuz/xamiuz-trading/blob/main/dataset/xamiuz_trading_sft_full.jsonl
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Contacto del desarrollador: panduwirayuda12345@gmail.com
