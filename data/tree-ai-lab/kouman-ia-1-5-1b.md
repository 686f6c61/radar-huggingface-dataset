# Tree-AI-lab/kouman-IA-1.5-1B

## Resumen

Kouman IA 1.5 (1B) es un modelo de lenguaje de 1.235.814.400 parámetros desarrollado por Tree IA labs, un laboratorio centrado en inteligencia artificial soberana africana. Se construye mediante un ajuste fino supervisado (SFT directo) sobre el checkpoint `Tree-AI-lab/llama-3.2-1b-baoule-instruct-v3`, que a su vez deriva de la arquitectura Llama 3.2 de 1B parámetros de Meta. El objetivo declarado es cubrir el baoulé (bci) y el dioula (dyu), dos lenguas minoritarias de Costa de Marfil, junto con francés e inglés.

El modelo se presenta como un "modelo soberano" orientado a traducción cruzada, preguntas y respuestas sobre cultura marfileña, y conversación multilingüe. Su relevancia radica en la escasez de modelos abiertos que cubran lenguas de bajos recursos del África Occidental, y en la publicación de los datasets de ajuste junto con los pesos.

La ficha se basa exclusivamente en la información disponible en HuggingFace y en la model card del autor. No se han publicado detalles sobre la composición exacta del corpus base, la tokenización específica para las lenguas locales ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parámetros totales | 1.235.814.400 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | baoulé (bci), dioula (dyu), francés (fr), inglés (en) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 2,5 GB |
| Modelo base | Tree-AI-lab/llama-3.2-1b-baoule-instruct-v3 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only denso de la familia Llama 3.2 con 1B parámetros, heredada del checkpoint `llama-3.2-1b-baoule-instruct-v3`. No se documentan modificaciones estructurales respecto al modelo base: no hay mezcla de expertos, ni atención lineal, ni componentes de estado recurrente.

El entrenamiento consiste en un ajuste fino supervisado (SFT directo) sobre 53.692 ejemplos agregados de tres datasets publicados por el propio laboratorio: `kouman-traduction-culture-sft` (25.692 ejemplos de traducción cruzada y cultura marfileña), `kouman-identity-instruct` (3.000 ejemplos de identidad "Kouman IA") y `smoltalk-multilingue` (25.000 ejemplos de fluidez conversacional). La model card no indica el número de tokens totales, la composición lingüística exacta del corpus, ni si se aplicaron etapas de RLHF o DPO posteriores al SFT. Tampoco se detalla el tokenizador empleado para el baoulé y el dioula, un punto crítico en lenguas de bajos recursos.

## Capacidades

- Generación de texto conversacional en baoulé, dioula, francés e inglés.
- Traducción cruzada entre las cuatro lenguas cubiertas, con énfasis en pares francés-baoulé y francés-dioula.
- Preguntas y respuestas sobre cultura marfileña, según el dataset `kouman-traduction-culture-sft`.
- Ajuste de identidad y estilo conversacional mediante `kouman-identity-instruct`.
- Fluidez multilingüe general gracias al corpus `smoltalk-multilingue`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta capacidad de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Traducción francés-baoulé y francés-dioula en herramientas de comunicación local: el modelo se entrena específicamente en pares de traducción cruzada, por lo que puede integrarse en interfaces de mensajería o portales administrativos para población que no domina el francés.
- Digitalización de contenidos culturales marfileños: generación de resúmenes y respuestas sobre patrimonio, tradiciones y referencias locales a partir de preguntas en francés o en lenguas locales.
- Asistentes conversacionales de baja latencia en entornos con hardware limitado: con 1B parámetros, el modelo puede desplegarse en una única GPU de consumo o incluso en CPU con cuantización, lo que facilita su uso en centros educativos o kioscos de información.
- Preservación y enseñanza de lenguas minoritarias: generación de ejercicios, ejemplos de uso y material didáctico en baoulé y dioula para programas escolares o iniciativas comunitarias.
- Atención al ciudadano en servicios públicos locales: respuestas a preguntas frecuentes en francés y en lenguas locales, con la ventaja de que el modelo está ajustado sobre un corpus de identidad y estilo propio.
- Moderación y clasificación de textos multilingües en Costa de Marfil: uso como base para tareas de etiquetado o filtrado en las cuatro lenguas cubiertas, aprovechando su tamaño reducido para inferencia por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,5 GB de pesos más overhead de activaciones, en torno a 3-4 GB en total.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,3-1,5 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): aproximadamente 0,8-1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en modelos como RTX 3050, RTX 3060, RTX 4060 y superiores. También es viable en CPU con llama.cpp.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers. No se documentan pesos GGUF en el repositorio, por lo que habría que convertirlos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kouman IA 1.5 (1B) | 1,24B | no disponible | bci, dyu, fr, en | Llama 3.2 Community | HuggingFace |
| Llama 3.2 1B Instruct | 1,24B | 128K (según Meta) | multilingüe general, sin bci/dyu | Llama 3.2 Community | HuggingFace |
| Qwen2.5 1.5B Instruct | 1,54B | 32K | multilingüe general, sin bci/dyu | Apache 2.0 | HuggingFace |
| SmolLM2 1.7B Instruct | 1,7B | 8K | multilingüe general, sin bci/dyu | Apache 2.0 | HuggingFace |

La comparativa se limita a modelos de tamaño similar; no se conocen modelos abiertos comparables específicamente entrenados para baoulé y dioula. Los datos de contexto de los modelos alternativos provienen de sus fichas públicas, no de la información proporcionada para Kouman IA.

## Limitaciones y advertencias

- La model card no documenta evaluación de sesgos; al entrenarse sobre datos de identidad y cultura específicos, puede reproducir estereotipos o perspectivas parciales sobre Costa de Marfil.
- Riesgo de alucinación elevado en un modelo de 1B parámetros, especialmente en traducción de términos técnicos o poco frecuentes en baoulé y dioula.
- La longitud de contexto no está especificada; no se debe asumir la ventana de 128K de Llama 3.2 sin verificación empírica.
- El tokenizador no está documentado para las lenguas locales, lo que puede degradar la calidad en textos con ortografía no normalizada.
- La licencia Llama 3.2 Community License impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligación de atribución y de nombrar el modelo "Llama" en determinados contextos) y requiere revisión legal antes de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.
- No se han publicado benchmarks, por lo que el rendimiento real frente a modelos base es desconocido.
- El modelo se entrenó con SFT directo; no hay evidencia de etapas de alineación posteriores (RLHF/DPO) que mitiguen respuestas dañinas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tree-AI-lab/kouman-IA-1.5-1B
- Organización Tree IA labs: https://huggingface.co/Tree-AI-lab
- Modelo base: https://huggingface.co/Tree-AI-lab/llama-3.2-1b-baoule-instruct-v3
- Dataset de traducción y cultura: https://huggingface.co/datasets/Tree-AI-lab/kouman-traduction-culture-sft
- Dataset de identidad: https://huggingface.co/datasets/Tree-AI-lab/kouman-identity-instruct
- Dataset multilingüe: https://huggingface.co/datasets/Tree-AI-lab/smoltalk-multilingue
