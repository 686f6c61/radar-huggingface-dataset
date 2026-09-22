# WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_LoRA_Qwen3-8b

## Resumen

El repositorio WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_LoRA_Qwen3-8b contiene un adaptador LoRA (librería PEFT, versión 0.17.1) entrenado sobre el modelo base Qwen/Qwen3-8B-Base. La nomenclatura del identificador indica que el ajuste se ha realizado sobre la tarea XNLI (inferencia de lenguaje natural, tres clases: implicación, neutral y contradicción) en inglés y urdu, con un subconjunto de 5000 ejemplos y algún tipo de barrido o fracción de datos designado como "percentage_1_120". El repositorio ocupa 0,5 GB y se publicó el 21 de septiembre de 2026.

El adaptador no es un modelo completo: requiere descargar Qwen/Qwen3-8B-Base (aproximadamente 8 200 millones de parámetros en precisión completa) y cargar los pesos LoRA encima, ya sea fusionándolos o mediante PEFT/vLLM. La model card publicada es la plantilla por defecto de HuggingFace sin ninguna sección cumplimentada: todas las entradas aparecen como "[More Information Needed]", por lo que no hay información del autor sobre datos de entrenamiento, hiperparámetros, licencia o evaluación.

La relevancia de este repositorio es fundamentalmente metodológica: ilustra el patrón de bajo coste de adaptar un LLM generativo de 8B a una tarea discriminativa multilingüe (NLI) con un adaptador de rango reducido, en lugar de entrenar un encoder especializado. No obstante, con 0 descargas y 0 "likes" en el momento de la consulta, carece de validación externa y no debería desplegarse en producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen/Qwen3-8B-Base); el repositorio contiene un adaptador LoRA, no pesos completos |
| Parámetros totales | 8 200 millones aproximadamente en el modelo base (dato heredado de la ficha pública de Qwen3-8B-Base); el número de parámetros entrenables del adaptador no está disponible |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible en la información del repositorio; el modelo base Qwen3-8B-Base soporta 32 768 tokens de forma nativa según su documentación pública |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización aplicaría al modelo base fusionado) |
| Idiomas soportados | Inglés y urdu, según el nombre del repositorio; no confirmado en la model card |
| Licencia | No disponible (la model card no la especifica; el modelo base Qwen3-8B-Base se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamaño del repositorio | 0,5 GB |
| Librería | peft 0.17.1, transformers |
| Pipeline declarado | text-generation |
| Fecha de publicación | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B-Base, un transformer decoder-only denso de la familia Qwen3. No hay información en el repositorio sobre la configuración LoRA empleada (rango, alpha, dropout, módulos objetivo ni número de parámetros entrenables). El tamaño del repositorio, 0,5 GB, es notablemente superior al de un adaptador LoRA de rango bajo típico (decenas o pocos cientos de MB), lo que sugiere un rango elevado, un conjunto amplio de módulos objetivo o la inclusión de estados adicionales; este extremo no se puede confirmar con los datos disponibles.

Respecto a los datos, el identificador apunta al corpus XNLI en su partición inglesa y urdu, con 5000 ejemplos y una variante etiquetada como "percentage_1_120", que sugiere un experimento de ablation sobre la fracción o el porcentaje de datos de entrenamiento utilizados. No hay información sobre composición exacta del dataset, número de tokens vistos, régimen de precisión (fp32, bf16, fp16), épocas, tasa de aprendizaje ni si se aplicó RLHF, DPO u otra técnica de alineación; en una tarea discriminativa como NLI esto último sería inusual. Tampoco se documenta ninguna innovación técnica (atención lineal, decodificación especulativa, destilación).

## Capacidades

- Clasificación de pares de frases en tres clases de NLI (implicación, neutral, contradicción) en inglés y urdu, según la tarea inferida del nombre del repositorio.
- Generación de texto heredada del modelo base Qwen3-8B-Base, aunque el ajuste LoRA puede haber degradado o desplazado esta capacidad; no está documentado ni evaluado.
- Capacidad multilingüe limitada, en principio, a los dos idiomas del ajuste (inglés y urdu); el modelo base cubre más idiomas, pero el adaptador no documenta su efecto sobre ellos.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible.
- Coherencia entre el "pipeline_tag" declarado (text-generation) y la tarea aparente (clasificación NLI): discrepancia no resuelta por el autor.

## Casos de uso

- Verificación de hechos en inglés: dado un par (premisa, hipótesis), el adaptador puede clasificar si la hipótesis se deduce de la premisa, lo que permite construir un comprobador de afirmaciones contra un corpus documental. Requiere validar antes su precisión real, que no está publicada.
- Detección de contradicciones en pipelines RAG: comprobar si la respuesta generada por un LLM está implicada por los fragmentos recuperados; una clasificación de "contradicción" o "neutral" señalaría posible alucinación. Es un uso natural de un modelo NLI, aunque aquí la ventana de contexto efectiva del clasificador dependería del modelo base.
- NLI en urdu para moderación y verificación de contenido: el adaptador es uno de los pocos artefactos públicos que apuntan a inferencia de lenguaje natural en urdu sobre un LLM de 8B, lo que lo hace útil como punto de partida para equipos que trabajan con ese idioma.
- Investigación sobre eficiencia de datos: el nombre "percentage_1_120" sugiere un estudio sistemático sobre el porcentaje de datos de ajuste necesario para una tarea multilingüe, lo que permite reproducir o extender ese tipo de análisis.
- Inicialización para transferencia cross-lingual: usar este adaptador como punto de partida (en lugar de LoRA desde cero) para añadir idiomas relacionados con el urdu, como el hindi, aprovechando la representación multilingüe del modelo base.
- Puntuación de coherencia en la construcción de datasets: filtrar pares de frases incoherentes al generar corpus sintéticos en inglés o urdu, empleando el clasificador como señal automática de calidad.
- Evaluación comparativa de adaptadores LoRA: al existir múltiples adaptadores XNLI sobre el mismo modelo base, este repositorio puede servir como referencia en experimentos internos de comparación de estrategias de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección "Evaluation" completamente vacía ("[More Information Needed]"), sin métricas de exactitud, F1, MMLU, HumanEval, GSM8K ni ninguna otra. Tampoco hay datos de latencia, throughput o consumo en el repositorio. Cualquier cifra que se quisiera usar en una comparativa tendría que obtenerse mediante una evaluación propia sobre las particiones estándar de XNLI en inglés y urdu.

## Requisitos de hardware

- VRAM estimada para inferencia (cifras orientativas, calculadas a partir de un modelo base denso de 8B, no publicadas por el autor):
  - fp16/bf16 sin cuantizar: 16-18 GB de VRAM para los pesos, más 2-4 GB de caché KV según la longitud de contexto.
  - Cuantización de 8 bits: aproximadamente 9-10 GB.
  - Cuantización de 4 bits (p. ej. GGUF Q4_K_M): aproximadamente 5-6 GB, más overhead de contexto.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues concurrentes sin cuantizar; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para fp16 en una sola GPU con lotes pequeños; RTX 4080/4070 Ti Super (16 GB) requieren cuantización de 8 o 4 bits.
- ¿Cabe en GPU de consumo? Sí: con cuantización de 4 bits cabe en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB). En fp16 cabe en GPUs de 24 GB.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM con soporte LoRA (multi-LoRA), TGI con adaptadores, y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF. El adaptador no se puede ejecutar por sí solo sin el modelo base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este adaptador, por lo que la comparativa se limita a características estructurales y de disponibilidad.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|---|
| Este adaptador (XNLI EN/UR LoRA sobre Qwen3-8B-Base) | LoRA sobre transformer denso | Adaptador no cuantificado; base de ~8 200 M | No disponible (base: 32 768 tokens) | No disponible | 0 descargas, 0 likes, model card vacía |
| Qwen/Qwen3-8B-Base | Transformer decoder-only denso | ~8 200 M | 32 768 tokens (ampliable con YaRN según documentación pública) | Apache 2.0 | Modelo oficial, ampliamente utilizado; sin ajuste específico para NLI |
| Encoders multilingües ajustados para XNLI (p. ej. XLM-RoBERTa-large) | Transformer encoder | ~560 M | 512 tokens | MIT (según la ficha del modelo) | Arquitectura estándar para NLI; más eficiente en coste y latencia, pero sin capacidades generativas |
| Otros adaptadores XNLI sobre Qwen3 | LoRA | Variables | No disponible | Variable | Existen múltiples repositorios comunitarios similares; sin benchmarks comparativos verificados en la información disponible |

## Limitaciones y advertencias

- Model card vacía: todas las secciones relevantes (uso previsto, sesgos, datos de entrenamiento, evaluación, impacto ambiental) están sin cumplimentar, lo que impide auditar el ajuste.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido. El modelo base es Apache 2.0, pero el autor del adaptador no declara términos propios, lo que introduce incertidumbre jurídica.
- Sin validación externa: 0 descargas y 0 likes; no hay informes de terceros sobre su comportamiento.
- Riesgo de sobreajuste: 5000 ejemplos para ajustar un modelo de 8B es un volumen bajo; la generalización fuera de la distribución de XNLI es dudosa, especialmente en urdu.
- Riesgo de alucinación: el modelo base es generativo y el adaptador no elimina esa propiedad, aunque la tarea objetivo sea clasificatoria; si se usa como generador, mantiene los sesgos y la tendencia a inventar del modelo original.
- Discrepancia de metadatos: el pipeline declarado es "text-generation" mientras que la tarea inferida del nombre es clasificación NLI; conviene revisar la salida real antes de integrarlo.
- Cobertura lingüística limitada: solo inglés y urdu según el identificador; no hay evidencia de comportamiento en castellano u otros idiomas.
- Limitación de contexto no documentada: se desconoce si el ajuste se realizó con secuencias largas; para NLI sobre documentos extensos habría que trocear y agregar.
- Sin datos de sesgo: no se ha evaluado el comportamiento diferencial entre subgrupos demográficos ni entre variedades dialectales del urdu.
- Sin garantías de reproducibilidad: no se documentan semillas, hiperparámetros ni la partición exacta de datos, por lo que replicar el resultado no es viable con la información publicada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_LoRA_Qwen3-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Documentación de PEFT: https://huggingface.co/docs/peft
- Referencia etiquetada en el repositorio (cálculo de impacto ambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automático citada en la plantilla: https://mlco2.github.io/impact
- Paper del corpus XNLI (no citado explícitamente en la model card, referenciado por el nombre del repositorio): https://arxiv.org/abs/1809.05053
