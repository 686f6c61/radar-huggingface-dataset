# subbuzdesk/gemma4-financial-sentiment

## Resumen

subbuzdesk/gemma4-financial-sentiment es un modelo de lenguaje pequeño (SLM) especializado en análisis de sentimiento financiero, desarrollado por Ambiakshi Financial Technologies. Se trata de un fine-tuning del modelo base Google Gemma 4 (google/gemma-4-e2b-it) mediante la técnica PEFT con LoRA de rango 16, entrenado en precisión nativa de 16 bits sobre un corpus de disclosures financieros anotados por expertos, archivos SEC 10-K y transcripciones de llamadas de resultados. El modelo está diseñado para generar salidas estructuradas en JSON con el sentimiento (BULLISH, BEARISH o NEUTRAL), un nivel de confianza, el factor principal y una señal de trading.

La relevancia de este modelo radica en su combinación de una ventana de contexto de 8192 tokens, que permite procesar documentos financieros extensos sin truncamiento, y su capacidad de razonamiento financiero encadenado (chain-of-thought). Según la model card, alcanza una precisión del 93,4% y un F1 macro del 92,8% en su tarea objetivo, superando a modelos como FinBERT, GPT-4 en zero-shot y BloombergGPT. Su licencia Apache 2.0 permite uso comercial y privado sin restricciones, y su tamaño reducido lo hace apto para despliegue en entornos locales o de borde.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en Google Gemma 4) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No disponible (se menciona GGUF en los tags, sin detalle) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (adaptador PEFT/LoRA, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo se construye sobre el modelo base Google Gemma 4 (google/gemma-4-e2b-it), aunque no se especifican los detalles arquitectónicos exactos de Gemma 4 en la información proporcionada. El fine-tuning se realiza mediante PEFT con LoRA de rango 16, manteniendo los pesos del modelo base congelados y entrenando únicamente los adaptadores. El entrenamiento se lleva a cabo en precisión nativa de 16 bits (float16), lo que evita la degradación por cuantización. El dataset de entrenamiento incluye disclosures financieros anotados por expertos, archivos SEC 10-K y transcripciones de earnings calls, aunque no se proporcionan cifras sobre el número de tokens ni la composición exacta del corpus. No se menciona el uso de RLHF o DPO; el enfoque es un fine-tuning supervisado clásico.

## Capacidades

- Análisis de sentimiento financiero: clasifica textos en BULLISH, BEARISH o NEUTRAL.
- Salida estructurada en JSON: genera un objeto con los campos `sentiment`, `confidence` (0.0–1.0), `primary_driver` y `stock_signal`.
- Razonamiento financiero encadenado (chain-of-thought): procesa información contextual para fundamentar la decisión de sentimiento.
- Ventana de contexto larga: 8192 tokens, suficiente para analizar informes financieros extensos o transcripciones completas de llamadas de resultados.
- Generación de texto en inglés: orientado a documentos financieros en ese idioma.
- Eficiencia computacional: velocidad de inferencia de 80–120 tokens/segundo en Apple Silicon (M1/M2/M3/M4) o GPUs estándar, según la model card.

## Casos de uso

- Análisis de informes anuales (10-K): el modelo puede procesar secciones completas de riesgos y factores de negocio, extrayendo el sentimiento general y los drivers principales, gracias a su ventana de 8192 tokens.
- Evaluación de transcripciones de earnings calls: permite resumir el tono de la llamada y generar una señal de trading (stock_signal) para decisiones de inversión a corto plazo.
- Monitoreo de noticias financieras: integrado en un pipeline de procesamiento de noticias, clasifica artículos en tiempo real y alimenta dashboards de sentimiento de mercado.
- Asistente para analistas de inversión: genera resúmenes estructurados de documentos financieros, reduciendo el tiempo de lectura manual y facilitando la comparación entre empresas.
- Sistemas de trading algorítmico: la salida JSON con confianza y señal puede conectarse directamente a motores de ejecución de órdenes para estrategias basadas en sentimiento.
- Herramientas de cumplimiento y auditoría: ayuda a revisar comunicaciones corporativas para detectar lenguaje excesivamente optimista o pesimista que pueda incumplir normativas.

## Benchmarks y rendimiento

La model card proporciona una comparativa con modelos de referencia en la tarea de análisis de sentimiento financiero. Los resultados son los siguientes:

| Modelo | Contexto | Accuracy | Macro F1 |
| :--- | :--- | :--- | :--- |
| FinBERT (tradicional) | 512 tokens | 86,2% | 84,1% |
| GPT-4 (zero-shot) | 128k tokens | 81,5% | 80,8% |
| BloombergGPT (50B) | 2.048 tokens | 88,3% | 86,9% |
| **subbuzdesk/gemma4-financial-sentiment** | **8192 tokens** | **93,4%** | **92,8%** |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un adaptador LoRA sobre un modelo base, la VRAM dependerá del tamaño del modelo base Gemma 4, que no se especifica.
- GPU recomendadas: la model card indica que funciona en Apple Silicon (M1/M2/M3/M4) y GPUs estándar, sin especificar modelos concretos.
- Compatibilidad con GPU de consumo: probablemente sí, dado que se describe como "local & edge friendly", pero no hay datos exactos de VRAM.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft` en Python. También se menciona el tag GGUF, lo que sugiere compatibilidad con `llama.cpp` u Ollama, aunque no se detalla.
- Latencia y throughput: 80–120 tokens/segundo en Apple Silicon o GPUs estándar, según la model card.

## Comparativa con modelos similares

La tabla de benchmarks anterior ya compara con FinBERT, GPT-4 y BloombergGPT. Estos son los modelos más relevantes en la misma categoría de análisis de sentimiento financiero. No se dispone de información sobre otros modelos comparables en cuanto a tamaño o licencia.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés, por lo que no es adecuado para textos financieros en otros idiomas sin adaptación.
- No se han documentado sesgos específicos, pero al ser un modelo de nicho entrenado en un corpus financiero, puede presentar alucinaciones en contextos fuera de su dominio.
- La ventana de contexto de 8192 tokens, aunque amplia, es inferior a la de modelos como GPT-4 (128k), lo que limita el análisis de documentos extremadamente largos.
- No se proporcionan detalles sobre el dataset de entrenamiento (tamaño, equilibrio de clases, procedencia), lo que dificulta evaluar posibles sesgos de selección.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 tiene sus propias condiciones de uso que deben revisarse.
- El modelo es un adaptador LoRA, por lo que requiere el modelo base para funcionar; no es un modelo autónomo.

## Enlaces

- [HuggingFace: subbuzdesk/gemma4-financial-sentiment](https://huggingface.co/subbuzdesk/gemma4-financial-sentiment)
- [Gemma 4 — Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Blog de Gemma 4 en HuggingFace](https://huggingface.co/blog/gemma4)
- [Model card de Gemma 4 en Google AI for Developers](https://ai.google.dev/gemma/docs/core/model_card_4)
