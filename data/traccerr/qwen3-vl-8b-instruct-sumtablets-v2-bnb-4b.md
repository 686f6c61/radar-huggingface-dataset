# TRACCERR/Qwen3-VL-8B-Instruct-Sumtablets-V2-bnb-4b

## Resumen

Qwen3-VL-8B-Instruct-Sumtablets-V2-bnb-4b es un ajuste fino mediante QLoRA del modelo multimodal Qwen3-VL-8B-Instruct, especializado en la transliteración automática de secuencias de signos cuneiformes sumerios a transliteración latina académica. Lo desarrolla el usuario TRACCERR y está pensado como herramienta de asistencia para asiriólogos, investigadores de humanidades digitales y desarrolladores que trabajan con corpus mesopotámicos, en particular con datos de la Cuneiform Digital Library Initiative (CDLI).

El modelo parte de la torre de lenguaje de Qwen3-VL (aproximadamente 8.190 millones de parámetros según los pesos en safetensors), cuantizado en NF4 de 4 bits, y se entrena sobre el conjunto de datos SumTablets (82.452 muestras de entrenamiento). La tarea aprendida es la conversión de nombres de signos en ASCII (`glyph_names`) a transliteración académica con marcadores estructurales, determinativos divinos y numerales sexagesimales.

Su relevancia radica en la escasez de modelos abiertos para lenguas muertas y en la dificultad del dominio: la transliteración cuneiforme exige preservar diacríticos, subíndices y convenciones editoriales muy específicas. El autor reporta una coincidencia media de tokens del 92,4 % en el conjunto de test retenido, aunque no se han publicado resultados en benchmarks estándar de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (modelo vision-lenguaje; solo se ajusta la torre de lenguaje) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud máxima de secuencia usada en entrenamiento); contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantizacion | NF4 4-bit (QLoRA); pesos publicados en bnb-4bit; el repositorio incluye también formato GGUF |
| Idiomas soportados | sumerio (sux) y inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (bnb-4bit) y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste QLoRA sobre `unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit`, una cuantización NF4 de 4 bits del Qwen3-VL-8B-Instruct original. Solo se entrenan 43,6 millones de parámetros (0,50 % del total) mediante adaptadores LoRA de rango 16 y alpha 16 con RSLoRA activado, aplicados a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó con Unsloth Studio 2026.5.10 sobre una única NVIDIA RTX 5080 de 16 GB durante 3 h 54 min 38 s, con AdamW de 8 bits, learning rate 8e-05, scheduler coseno, warmup de 20 pasos, batch efectivo de 16, empaquetado de secuencias y checkpointing de gradientes optimizado.

El conjunto de datos es `colesimmons/SumTablets` (licencia CC-BY-4.0), con 82.452 muestras de entrenamiento, 4.580 de validación y 4.580 de test. La entrada es el campo `glyph_names` (nombres de signos cuneiformes en ASCII) y el objetivo es `transliteration` (transliteración latina académica). El entrenamiento se detuvo en el paso ~1161, aproximadamente el 22 % de una época, con una pérdida final reportada de ~0,202 y una pérdida mínima observada de 0,2844. El autor advierte que, por un problema de mapeo de plantilla, la pérdida reportada incluye prompt y completion, por lo que la pérdida solo de completion estimada sería inferior. La norma del gradiente se mantuvo estable entre 0,55 y 0,90.

## Capacidades

- Conversión de secuencias de nombres de signos cuneiformes en ASCII a transliteración sumeria académica (por ejemplo, `DIŠ LU ŠE AN EN KID` → `1(diš) udu še {d}en-lil₂`).
- Preservación de marcadores estructurales editoriales: `<SURFACE>`, `<COLUMN>`, `<BLANK_SPACE>` y `<RULING>`.
- Manejo de subíndices y diacríticos académicos: `₂`, `₃`, `š`, `ŋ`, `ḫ`.
- Generación correcta de determinativos: `{d}` (divino), `{ki}` (lugar), `{geš}` (madera), `{munus}` (femenino), `{dug}` (recipiente).
- Renderizado de cualificadores numéricos y notación sexagesimal: `1(diš)`, `2(ban₂)`, `3(barig)`, `4(geš₂)`.
- Tratamiento de signos dañados o ilegibles mediante tokens `<unk>`.
- Generalización declarada a través de distintos periodos históricos y géneros de tablillas.
- Procesamiento de texto únicamente: la torre de visión no se ha ajustado, por lo que no lee imágenes de tablillas de forma fiable.
- Soporte conversacional según la etiqueta `conversational` del repositorio; no se detalla soporte explícito de tool calling ni de razonamiento multi-paso en la información disponible.

## Casos de uso

- Transliteración masiva de corpus: procesar lotes de secuencias `glyph_names` procedentes de bases de datos cuneiformes para obtener una primera pasada de transliteración antes de la revisión experta, aprovechando el volumen de entrenamiento (82.452 muestras) y la preservación de marcadores estructurales.
- Asistencia a investigadores de CDLI: integrar el modelo en flujos de trabajo que manejan datos de la Cuneiform Digital Library Initiative para acelerar la catalogación de tablillas y la conversión de registros ASCII a formato académico publicable.
- Herramienta educativa para estudiantes de sumerio: generar transliteraciones de referencia con determinativos y numerales correctos que sirvan como material de práctica, dado el 100 % de precisión reportada en marcadores numéricos y estructurales.
- Preprocesamiento en pipelines de humanidades digitales: normalizar grandes archivos de signos a transliteración latina antes de aplicar análisis estadístico, búsqueda o alineamiento de corpus.
- Modelo base para ajustes posteriores: servir como punto de partida para fine-tuning sobre géneros concretos (por ejemplo, tablillas administrativas de Ur III) o periodos específicos, gracias a la licencia CC-BY-4.0 y al formato GGUF disponible para despliegue ligero.
- Prototipado de aplicaciones de lenguas muertas: construir demos o interfaces de consulta para arqueólogos e historiadores que necesiten una capa automática de transliteración sin infraestructura de GPU de gran tamaño, al poder ejecutarse en cuantización 4-bit.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Coincidencia media de tokens (test retenido) | 92,4 % |
| Precisión de marcadores numéricos | 100 % |
| Preservación de etiquetas estructurales | 100 % |
| Pérdida final de entrenamiento (paso ~1161) | ~0,202 |
| Mejor pérdida puntual observada | 0,2844 |

No se han publicado resultados en benchmarks estándar de NLP (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores son específicas del dominio y reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados en NF4 4-bit ocupan aproximadamente 4-5 GB; con overhead de activaciones y contexto de 4096 tokens, se estima un consumo de 6-8 GB en GPU.
- GPU recomendadas: el ajuste se entrenó en una RTX 5080 de 16 GB; para inferencia son suficientes GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). Para mayor throughput, A100 o H100.
- Cabe en GPU consumer: sí, en modelos con al menos 8 GB de VRAM en cuantización 4-bit.
- Opciones de despliegue: transformers (formato bnb-4bit), llama.cpp u Ollama mediante los ficheros GGUF del repositorio, y servidores compatibles con la API de endpoints (etiqueta `endpoints_compatible`). vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. El entrenamiento completo requirió 3 h 54 min en una RTX 5080 para ~1161 pasos, dato no extrapolable directamente a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TRACCERR/Qwen3-VL-8B-Instruct-Sumtablets-V2-bnb-4b | 8,19 B | 4096 (entrenamiento) | Transliteración cuneiforme sumeria | CC-BY-4.0 | Hugging Face |
| Qwen/Qwen3-VL-8B-Instruct (base) | ~8 B | no disponible | Multimodal general | no disponible en la información | Hugging Face |
| Alternativas especializadas en lenguas muertas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables especializados en transliteración cuneiforme en la documentación proporcionada.

## Limitaciones y advertencias

- No lee imágenes de tablillas: la torre de visión no se ha ajustado, por lo que la inferencia es solo de texto.
- Precisión garantizada únicamente dentro de la distribución de SumTablets; las secuencias fuera de ese dominio pueden producir transliteraciones incorrectas.
- No sustituye la revisión de un asiriólogo experto para trabajos destinados a publicación.
- Cobertura limitada de variantes de signos raras o arcaicas poco representadas en los datos de entrenamiento.
- Riesgo de alucinación en signos dañados o poco frecuentes, aunque el modelo maneja tokens `<unk>`.
- Sesgos de los datos de entrenamiento: la distribución de SumTablets condiciona periodos, géneros y convenciones editoriales; la representación desequilibrada puede afectar a la calidad en subcorpus minoritarios.
- Entrenamiento parcial: solo ~22 % de una época, con pérdida calculada sobre prompt y completion, lo que puede dejar margen de mejora.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene verificar las condiciones de los datos de entrenamiento (también CC-BY-4.0) y del modelo base.
- Idiomas limitados a sumerio e inglés; no hay soporte declarado para acadio u otras lenguas mesopotámicas pese a las etiquetas del repositorio.
- El repositorio ocupa 55 GB, lo que puede complicar su descarga y almacenamiento en entornos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TRACCERR/Qwen3-VL-8B-Instruct-Sumtablets-V2-bnb-4b
- Modelo base: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit
- Qwen3-VL-8B-Instruct original: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset SumTablets: https://huggingface.co/datasets/colesimmons/SumTablets
- Cuneiform Digital Library Initiative (CDLI): https://cdli.mpiwg-berlin.mpg.de/
- Unsloth: https://github.com/unslothai/unsloth
- Imagen de portada del autor: https://huggingface.co/TRACCERR/Qwen3-VL-8B-Instruct-Cuneiform-v4/resolve/main/assets/ancient-writing-modern-ai.png
