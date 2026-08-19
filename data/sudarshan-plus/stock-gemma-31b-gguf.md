# sudarshan-plus/stock-gemma-31b-GGUF

## Resumen

El modelo `sudarshan-plus/stock-gemma-31b-GGUF` es un ajuste fino (fine-tune) del modelo base `google/gemma-4-31B-it`, desarrollado por Sudarshan con el objetivo de analizar datos técnicos de acciones del mercado indio (NSE). Está especializado en cinco símbolos concretos: REL (Reliance Industries), TCS (Tata Consultancy Services), INFY (Infosys), HDFCBANK y ICICIBANK. El modelo recibe una instantánea técnica (precio de cierre, medias móviles, RSI, MACD, volatilidad y volumen) y genera un desglose analítico con una recomendación a cinco días (BUY, SELL o HOLD).

Se distribuye en formato GGUF, con un tamaño de repositorio de 18,7 GB y aproximadamente 30.700 millones de parámetros. La licencia es Apache 2.0, lo que permite uso comercial, aunque el autor advierte explícitamente que el modelo no debe utilizarse para tomar decisiones financieras reales. Es una versión actualizada de un modelo anterior llamado `stock-gemma-merged-new`, y su fecha de corte de conocimiento es el 14 de agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de google/gemma-4-31B-it (arquitectura base no especificada) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (tipos específicos no indicados) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo `google/gemma-4-31B-it`, por lo que hereda su arquitectura base, aunque no se proporcionan detalles técnicos sobre la misma (número de capas, mecanismo de atención, etc.). El entrenamiento se realizó sobre datos propietarios correspondientes a los cinco símbolos NSE mencionados, con un enfoque cronológico. Se utilizó el módulo FastLanguageModel y GPUs compartidas de tipo freemium en la nube, con precisión fp16 y una GPU A100-80GB. El autor indica que el 10% de los datos se reservó para pruebas. No se mencionan técnicas como RLHF o DPO; el proceso parece ser un fine-tuning supervisado estándar sobre datos técnicos de mercado.

## Capacidades

- Análisis técnico de acciones: interpreta indicadores como SMA de 20 y 50 días, RSI (14), MACD, volatilidad de 20 días y cambio de volumen.
- Generación de recomendaciones a corto plazo: produce una recomendación de 5 días (BUY, SELL o HOLD) con un razonamiento cuantitativo estructurado.
- Salida en formato de informe: el modelo genera un desglose analítico con secciones (tendencia, momentum, volatilidad, síntesis cuantitativa) y una recomendación final.
- Capacidades conversacionales: al estar basado en Gemma 4 31B it, conserva habilidades generales de diálogo e instrucción, aunque no se documentan explícitamente.
- Soporte de tool calling y agentes: no se menciona en la información proporcionada.
- Capacidades multilingües: solo inglés, según la model card.

## Casos de uso

- Análisis técnico educativo: el modelo puede utilizarse en entornos de formación para ilustrar cómo se interpretan los indicadores técnicos (RSI, MACD, medias móviles) y cómo se construye una recomendación a partir de ellos. Su salida estructurada facilita la explicación de conceptos de análisis cuantitativo.
- Generación de informes de mercado automatizados: integrado en un pipeline de datos financieros, puede producir informes diarios sobre los cinco símbolos NSE cubiertos, resumiendo el estado técnico de cada acción en lenguaje natural.
- Asistente para analistas junior: sirve como herramienta de apoyo para analistas que necesitan una primera lectura rápida de los datos técnicos antes de profundizar en el análisis fundamental.
- Prototipos de sistemas de recomendación bursátil: aunque no debe usarse para decisiones reales, puede servir como base para experimentar con modelos de lenguaje aplicados a mercados financieros.
- Pruebas de concepto en finanzas cuantitativas: investigadores pueden evaluar la viabilidad de modelos de gran tamaño (30B) en tareas de análisis técnico, comparando su rendimiento con modelos más pequeños.
- Demostraciones de fine-tuning vertical: el modelo ejemplifica cómo ajustar un LLM generalista a un dominio específico con datos propietarios, útil para desarrolladores que quieran replicar el proceso en otros sectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 30,7B parámetros en formato GGUF, el tamaño del repositorio (18,7 GB) sugiere que una cuantización de 4 bits podría caber en una GPU con 24 GB de VRAM, pero no se confirma.
- GPU recomendadas: no especificadas. El entrenamiento usó A100-80GB, pero la inferencia podría ejecutarse en GPUs consumer como RTX 3090 o RTX 4090 si la cuantización es lo suficientemente baja.
- Compatibilidad con consumer GPU: probablemente sí con cuantización Q4 o inferior, aunque no hay datos confirmados.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama y otros runners que soporten este formato. También podría servirse con vLLM o TGI si se convierte a safetensors, pero no se indica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en el ámbito de análisis técnico bursátil con fine-tuning sobre Gemma 4 31B. El modelo base `google/gemma-4-31B-it` es el punto de referencia natural, pero no se han publicado comparativas directas. Por tanto, la comparativa se limita a señalar que es un fine-tune vertical de un modelo generalista de 31B, sin datos cuantitativos de rendimiento relativo.

## Limitaciones y advertencias

- No apto para decisiones financieras: el autor declara explícitamente que el modelo no debe utilizarse para tomar decisiones de inversión reales y que no se responsabiliza de pérdidas económicas.
- Sin garantía de precisión: la model card indica que no hay garantía de que las predicciones sean correctas.
- Datos de entrenamiento propietarios: no se detalla la composición exacta del dataset, lo que dificulta evaluar posibles sesgos en los datos.
- Alcance limitado: solo cubre cinco símbolos del NSE; no es aplicable a otros mercados o acciones sin un nuevo fine-tuning.
- Idioma restringido: solo inglés, lo que limita su uso en entornos hispanohablantes sin traducción previa.
- Entrenamiento con recursos limitados: se usaron GPUs compartidas freemium, lo que puede afectar a la calidad del entrenamiento (el propio autor menciona que la eficiencia no está garantizada).
- Sin benchmarks publicados: no hay métricas objetivas que permitan validar su rendimiento frente a otros modelos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sudarshan-plus/stock-gemma-31b-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
