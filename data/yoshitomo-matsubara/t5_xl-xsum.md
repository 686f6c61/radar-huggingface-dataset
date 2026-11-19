# yoshitomo-matsubara/t5_xl-xsum

## Resumen

`t5_xl-xsum` es un modelo de resumen abstractivo en inglés desarrollado por Yoshitomo Matsubara, investigador asociado a torchdistill. Se trata de un ajuste fino completo (full fine-tuning) de `google/t5-xl-lm-adapt`, el T5 v1.1 XL de 3B parámetros con arquitectura encoder-decoder (24 capas en encoder y 24 en decoder), entrenado sobre el corpus XSum de noticias de la BBC. El modelo resuelve la tarea de generar resúmenes de una sola frase a partir de documentos periodísticos largos, con entradas de hasta 1.024 tokens y salidas de hasta 64 tokens.

Su relevancia actual es metodológica más que de producto: reproduce la etapa de supervisión del artículo GKD (Agarwal et al., ICLR 2024) y actúa como **profesor supervisado** en los experimentos de destilación de conocimiento sobre la familia T5. Todos los configurados de destilación de torchdistill (estudiantes T5-small, T5-base y T5-large) cargan este checkpoint como referencia. Es, por tanto, una pieza de infraestructura para investigación en compresión de modelos, no un modelo pensado para despliegue directo en producción.

El checkpoint se publica con licencia Apache 2.0, pesos en `safetensors` a precisión float32, un tamaño de repositorio de 11,9 GB y 2.981.353.472 parámetros reales. No registra descargas ni interacciones en el momento de la consulta, lo que refleja su carácter de artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5 v1.1), 24 capas de encoder + 24 de decoder |
| Parametros totales | 2.981.353.472 (~3B) |
| Parametros activos | no disponible (no es MoE; denso) |
| Longitud de contexto | 1.024 tokens de entrada en entrenamiento (tokenizer con `model_max_length` de 512, ampliable); salida de hasta 64 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; el autor recomienda bf16 o fp32, advierte de desbordamiento en fp16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (float32) |

## Arquitectura y entrenamiento

El modelo parte de `google/t5-xl-lm-adapt`, un T5 v1.1 adaptado con objetivo de modelado de lenguaje antes del ajuste supervisado. La arquitectura es un transformer encoder-decoder denso de 24+24 capas y ~3B parámetros, sin mecanismos de atención lineal ni mezcla de expertos. El ajuste fino es de parámetros completos con entropía cruzada sobre los resúmenes de referencia, usando el prefijo `summarize: ` en la entrada y longitudes de 1.024 tokens de entrada y 64 de salida.

El entrenamiento usa el 99% del split `train` de `EdinburghNLP/xsum` (204.045 ejemplos totales; el 1% restante se reserva como split de monitorización de perplejidad), con validación y test reportados por separado. Se ejecutaron 8.000 pasos del optimizador Adafactor (lr 3e-4, `scale_parameter=False`, `relative_step=False`, `warmup_init=False`), batch efectivo de 32 (4 por dispositivo × 2 dispositivos × acumulación 4), schedule warmup-stable-decay (400 pasos de warmup lineal, meseta y decaimiento lineal a 0 en los últimos 2.000 pasos), dropout 0.1 (desviación deliberada respecto al 0.0 de la Tabla A.1 del paper para evitar sobreajuste), gradient checkpointing y FSDP2 sobre 2 GPUs de 24 GB en bf16 con pesos maestros fp32. El tiempo total de entrenamiento fue de ~22 h 21 min (16 h 55 min el primer epoch), semilla 42 y checkpoint final (`ckpt_selection: 'last'`), ya que el paper no selecciona checkpoint.

## Capacidades

- Generación de resúmenes abstractivos de una frase a partir de documentos periodísticos en inglés.
- Compresión extractiva-abstractiva: condensa artículos largos (hasta 1.024 tokens) en salidas de hasta 64 tokens.
- Entrenado específicamente para el estilo XSum (resúmenes muy cortos y altamente abstractivos, típicos de la BBC).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo agente.
- No dispone de capacidades multimodales (visión, audio) ni de modo "thinking".
- Capacidad multilingüe limitada al inglés; no se ha entrenado ni evaluado en otros idiomas.
- Sirve como profesor para destilación de conocimiento hacia estudiantes T5-small, T5-base y T5-large.

## Casos de uso

- **Profesor en pipelines de destilación de conocimiento**: cargar este checkpoint como teacher en configuraciones de torchdistill para entrenar estudiantes T5-small/base/large con GKD; es exactamente el rol para el que se publicó y el escenario donde su licencia Apache 2.0 y sus pesos fp32 resultan útiles.
- **Resumen automático de noticias en inglés**: generar titulares o sumarios de una frase a partir de artículos de prensa, con entradas de hasta 1.024 tokens y decodificación greedy de 64 tokens, replicando el protocolo de evaluación del autor.
- **Generación de resúmenes para boletines y alertas**: producir síntesis breves de comunicados o notas de prensa en inglés para alimentar sistemas de distribución; el formato XSum (una sola frase) encaja con resúmenes de tipo "lead".
- **Línea base de investigación en summarization**: usar el checkpoint como referencia supervisada contra la que comparar variantes destiladas o modelos más pequeños en XSum, con métricas ROUGE reproducibles.
- **Evaluación de técnicas de compresión**: medir la brecha entre el profesor de 3B y estudiantes de 60M–770M parámetros en ROUGE-1/2/L sobre los splits de validación y test de XSum.
- **Generación de datos sintéticos de resumen**: emplear el modelo para producir resúmenes de referencia sobre corpus periodísticos propios en inglés y construir datasets de ajuste para modelos menores.
- **Prototipado de resumen en entornos de investigación con GPUs de 24 GB**: el autor documenta que el entrenamiento cabe en 2×24 GB con FSDP2, lo que indica que la inferencia en bf16 es viable en hardware de gama alta de consumo profesional.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Split | ROUGE-1 | ROUGE-2 | ROUGE-L |
|---|---|---|---|
| XSum test | 44,82 | 21,40 | 36,72 |
| XSum validation | 44,89 | 21,37 | 36,79 |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~12 GB en fp32 (pesos de 2,98B parámetros × 4 bytes); ~6 GB en bf16. El autor advierte explícitamente de que T5 desborda en fp16, por lo que debe usarse bf16 o fp32.
- **GPU recomendadas**: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en bf16 con margen. El entrenamiento documentado usó 2×24 GB con FSDP2.
- **Cabe en GPU de consumo**: sí, en RTX 3090/4090 (24 GB) y en GPUs de 16 GB en bf16 con `device_map='auto'`; en 12 GB requiere cuantización, para la cual no se documentan recetas.
- **Opciones de despliegue**: `transformers` (referencia del autor), `text-generation-inference` (etiqueta `endpoints_compatible` en el repo), vLLM y TGI para serving; llama.cpp/Ollama no están documentados para este checkpoint.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto entrada | XSum ROUGE-1/2/L | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yoshitomo-matsubara/t5_xl-xsum` | ~3B | 1.024 | 44,82 / 21,40 / 36,72 (test) | Apache 2.0 | Hugging Face |
| `google/t5-xl-lm-adapt` (base sin ajustar) | ~3B | 512 por defecto | no disponible | Apache 2.0 | Hugging Face |
| Estudiantes T5-small/base/large destilados (GKD) | 60M–770M | 1.024 | no disponible en esta ficha | Apache 2.0 (presumible) | torchdistill / HF |

La comparación directa con alternativas de la misma categoría (p. ej. BART-large-XSum, PEGASUS-XSum) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Idioma**: solo inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- **Estilo XSum**: el modelo está sesgado hacia resúmenes muy cortos y abstractivos de una frase; puede producir resúmenes alucinados o poco fieles al documento, un problema conocido del corpus XSum.
- **Riesgo de alucinación**: los resúmenes abstractivos de XSum priorizan la fluidez sobre la fidelidad; no debe usarse en dominios donde la exactitud factual sea crítica sin verificación humana.
- **Longitud de contexto**: entradas de 1.024 tokens en entrenamiento; el `model_max_length` del tokenizer es 512, por lo que es necesario pasar `max_length=1024` explícitamente para no truncar antes de lo previsto.
- **Configuración de generación**: el `generation_config.json` incluido no fija longitud; sin `max_new_tokens=64` la generación se detiene en el valor por defecto de 20 tokens de la librería.
- **Precisión**: no usar fp16 (desbordamiento documentado); usar bf16 o fp32.
- **Sobreajuste**: el autor documenta que con dropout 0.0 el ajuste fino sobreajusta (perplejidad de monitorización 5,2 tras el epoch 1 y 52 tras el epoch 8 en T5-base), motivo por el que se elevó a 0.1.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo se distribuye como artefacto de investigación sin garantías de calidad en producción; conviene evaluar fidelidad y sesgos antes de desplegarlo.
- **Sesgos**: no se documentan análisis de sesgo en la información disponible; al entrenarse sobre noticias de la BBC, puede heredar sesgos editoriales y de cobertura del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yoshitomo-matsubara/t5_xl-xsum
- Modelo base: https://huggingface.co/google/t5-xl-lm-adapt
- Dataset XSum: https://huggingface.co/datasets/EdinburghNLP/xsum
- Repositorio torchdistill: https://github.com/yoshitomo-matsubara/torchdistill
- Paper GKD (Agarwal et al., ICLR 2024): https://arxiv.org/abs/2306.13649
- Referencia arXiv del modelo (tag): https://arxiv.org/abs/2306.13649
