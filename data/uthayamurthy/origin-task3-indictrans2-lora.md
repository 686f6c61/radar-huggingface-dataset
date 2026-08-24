# uthayamurthy/origin-task3-indictrans2-lora

## Resumen

El modelo `uthayamurthy/origin-task3-indictrans2-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el equipo **Origin** para la tarea 3 de la competición SciHigh 2026. Su función específica es traducir títulos de artículos científicos del inglés al bengalí, utilizando como base el modelo multilingüe de traducción automática neuronal `ai4bharat/indictrans2-en-indic-1B` de AI4Bharat. No es un modelo completo, sino un adaptador que debe cargarse sobre el modelo base en una revisión concreta.

El adaptador se entrenó exclusivamente con los 60 tripletes oficiales de entrenamiento del conjunto `SpringerSSAT-Tiny-Multilingual` de SciHigh 2026, sin datos sintéticos ni etiquetas de prueba. Con solo 3,5 millones de parámetros entrenables (0,32% del total), logra mejoras modestas pero consistentes en métricas de traducción frente al modelo base sin adaptar, especialmente en SacreBLEU (+2,1 puntos). Su relevancia radica en demostrar que un ajuste fino ligero con pocos datos puede mejorar la traducción de dominios específicos (títulos científicos) sobre un modelo multilingüe preentrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (modelo base IndicTrans2 1B) + adaptador LoRA |
| Parametros totales | 1.119.082.496 (modelo base) + 3.538.944 (adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó máx. 128 tokens de origen y destino) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bfloat16/float32 según el dispositivo) |
| Idiomas soportados | Inglés (eng_Latn) → Bengalí (ben_Beng) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base `ai4bharat/indictrans2-en-indic-1B` es un transformer seq2seq de 1.000 millones de parámetros entrenado por AI4Bharat para traducción entre inglés y 22 lenguas indias programadas. Utiliza un tokenizer propio gestionado a través de `IndicTransToolkit` y soporta unificación de escrituras para lenguas de bajos recursos. El adaptador LoRA se aplica únicamente a las proyecciones `q_proj` y `k_proj` de la atención, con rango 16, alpha 32 y dropout 0,1.

El entrenamiento se realizó sobre 60 ejemplos oficiales de títulos científicos en inglés con sus traducciones bengalíes expertas. Se usaron 10 épocas, batch size 8, learning rate 2e-4, weight decay 0,01 y warmup ratio 0,1. La generación se hizo con 5 beams y máximo 96 tokens nuevos. No se emplearon datos sintéticos ni aumentación. La selección de checkpoint se basó en la validación sobre 20 ejemplos retenidos, evaluados una vez por época.

## Capacidades

- Traducción automática de títulos de artículos científicos del inglés al bengalí, con precisión en terminología académica.
- Generación de texto en bengalí con formato de títulos (sin puntuación final, capitalización adecuada).
- Integración con el ecosistema Hugging Face Transformers y PEFT para carga y uso sencillo.
- Soporte de inferencia en CPU y GPU mediante `torch_dtype` configurable (bfloat16 en GPU, float32 en CPU).
- Preprocesamiento y postprocesamiento lingüístico automático mediante `IndicProcessor` de IndicTransToolkit.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de traducción.

## Casos de uso

- **Indexación de bibliografía científica**: traducir títulos de papers en inglés a bengalí para catálogos de bibliotecas universitarias o repositorios institucionales, facilitando la búsqueda por idioma local.
- **Plataformas de revisión de literatura**: permitir a investigadores bengalíes identificar artículos relevantes leyendo títulos en su lengua materna antes de acceder al texto completo.
- **Sistemas de recomendación de papers**: integrar el adaptador en un pipeline que traduzca títulos para personalizar sugerencias a usuarios que prefieren contenido en bengalí.
- **Traducción de metadatos en editoriales**: editoriales académicas que publican abstracts y títulos en múltiples idiomas pueden usar este modelo para generar versiones bengalíes de títulos de forma automática.
- **Herramientas de accesibilidad**: traducir títulos de artículos en interfaces de bases de datos científicas para hablantes de bengalí con dominio limitado del inglés.
- **Evaluación de calidad de traducción**: servir como referencia para comparar otros sistemas de traducción automática en el dominio científico, dado que está especializado en títulos.

## Benchmarks y rendimiento

Los resultados se calcularon sobre los 20 títulos de validación retenidos. ROUGE-L usa tokens bengalíes separados por espacios.

| Metrica | LoRA adapter | Zero-shot IndicTrans2 1B | Delta |
|---|---|---|---|
| ROUGE-L F1 | **0,455671** | 0,429462 | +0,026209 |
| chrF++ | **51,1995** | 51,0039 | +0,1956 |
| SacreBLEU (tokenize=none) | **17,1911** | 15,0960 | +2,0951 |
| Exact match | 0,00% | 0,00% | 0,00 pp |

No se han publicado resultados en otros benchmarks estándar (MMLU, HumanEval, etc.) porque el modelo no está diseñado para tareas de razonamiento general.

## Requisitos de hardware

- **VRAM estimada**: el modelo base de 1B parámetros en bfloat16 ocupa aproximadamente 2 GB; con el adaptador y el tokenizador, la inferencia puede ejecutarse en GPUs con 4 GB o más. En float32, se necesitan unos 4,5 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, T4, A10). Para entrenamiento se usó una RTX PRO 6000 Blackwell de 96 GB, pero la inferencia es mucho más ligera.
- **Compatibilidad con GPUs de consumo**: sí, cabe en GPUs de consumo como RTX 3060, RTX 4060, etc., incluso en CPU con suficiente RAM (8 GB).
- **Opciones de despliegue**: se puede servir con Transformers + PEFT en un script Python, o exportar a ONNX para optimización. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo seq2seq y no un LLM autoregresivo estándar.
- **Latencia y throughput**: no se han publicado mediciones. En una GPU T4, se espera una latencia de decodificación de unos pocos segundos por título (5 beams, 96 tokens máx).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `uthayamurthy/origin-task3-indictrans2-lora` | 1,12B (base) + 3,5M (adaptador) | No disponible | Traducción EN→BN de títulos científicos | MIT | Hugging Face |
| `ai4bharat/indictrans2-en-indic-1B` (base) | 1,12B | No disponible | Traducción EN→22 lenguas indias | MIT | Hugging Face |
| `facebook/nllb-200-distilled-600M` | 600M | 512 tokens | Traducción multilingüe (200 idiomas) | CC-BY-NC 4.0 | Hugging Face |

No se dispone de comparaciones directas con otros adaptadores específicos para títulos científicos. La comparación con NLLB es orientativa, pero no se han ejecutado los mismos benchmarks.

## Limitaciones y advertencias

- **Datos de entrenamiento muy limitados**: solo 60 ejemplos, lo que puede provocar sobreajuste a patrones específicos de los títulos de Springer y baja generalización a otros dominios científicos.
- **Alcance restringido**: el adaptador solo traduce títulos, no abstracts ni textos completos. Su uso fuera de ese dominio degradará la calidad.
- **Riesgo de alucinación**: como todo modelo de traducción neuronal, puede generar traducciones plausibles pero incorrectas, especialmente con terminología técnica poco frecuente.
- **Dependencia del modelo base**: requiere cargar el modelo base en una revisión exacta (`10e65a9951a1e922cd109a95e8aba9357b62144b`); cambios en el modelo base pueden romper la compatibilidad.
- **Sesgos potenciales**: el entrenamiento con datos de una sola editorial (Springer) puede introducir sesgos hacia el estilo de títulos de esa fuente.
- **Licencia MIT**: permite uso comercial, pero el modelo base también es MIT, por lo que no hay restricciones adicionales. Sin embargo, los datos de entrenamiento de SciHigh pueden tener sus propias condiciones de uso.
- **Sin soporte para otros pares de idiomas**: el adaptador es exclusivo para inglés→bengalí; no se puede usar para otras direcciones.

## Enlaces

- [Modelo en Hugging Face (adaptador)](https://huggingface.co/uthayamurthy/origin-task3-indictrans2-lora)
- [Modelo base IndicTrans2 EN-INDIC 1B](https://huggingface.co/ai4bharat/indictrans2-en-indic-1B)
- [Repositorio GitHub de IndicTrans2](https://github.com/ai4bharat/IndicTrans2)
- [Página oficial de IndicTrans2 en AI4Bharat](https://ai4bharat.iitm.ac.in/areas/model/NMT/IndicTrans2/)
- [IndicTransToolkit (preprocesamiento)](https://github.com/VarunGumma/IndicTransToolkit)
