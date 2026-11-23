# yutengz/guobao-rvc

## Resumen

guobao-rvc es una colección de modelos de conversión de voz (voice conversion) basados en RVC v2, entrenados por el usuario yutengz a partir de diálogos de la serie de animación china 果宝特攻3 (Guobao Te Gong 3). El repositorio incluye, al menos, un modelo de personaje documentado: 菠萝吹雪 (Boluo Chuixue), con pesos en formato .pth de 40 kHz y un índice de recuperación basado en ContentVec. No se trata de un modelo de lenguaje ni de un transformer generativo de texto, sino de un sistema de clonación y conversión de timbre vocal pensado para tareas de síntesis de voz cantada y hablada.

El modelo se entrenó con Applio sobre 439 segmentos de audio (aproximadamente 21,6 minutos) extraídos de los episodios 1–5, 7 y 8 de la tercera temporada, tras un proceso de separación de fuentes con BS-Roformer para eliminar música y efectos. El resultado es un timbre con una altura tonal mediana cercana a D♯4, lo que condiciona su uso en covers: para voces femeninas originales en G♯4–B4 se recomienda bajar de 2 a 4 semitonos.

Su relevancia es acotada y de nicho: sirve como ejemplo práctico de un pipeline RVC v2 reproducible con Applio (separación de fuentes, etiquetado manual, entrenamiento con rmvpe y ContentVec) y como recurso lúdico para la comunidad de covers. La licencia es "other" y el autor restringe explícitamente el uso a fines de entretenimiento y no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (voice conversion, no transformer generativo de texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) |
| Licencia | other (uso solo entretenimiento/no comercial según model card) |
| Formato de pesos | .pth (RVC v2) + .index (ContentVec) |
| Frecuencia de muestreo | 40 kHz |
| Epocas de entrenamiento | 300 (24.000 steps) |
| Herramienta de entrenamiento | Applio |
| Extractor de F0 | rmvpe |
| Modelo de features | ContentVec |
| Preentrenado de vocoder | HiFi-GAN 40k |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de RVC v2: un encoder de contenido basado en ContentVec que extrae representaciones lingüísticas independientes del hablante, un extractor de pitch (rmvpe en este caso) que captura el contorno de F0, y un decoder/generador entrenado sobre un vocoder HiFi-GAN preentrenado a 40 kHz. El índice `.index` asociado permite la recuperación por similitud de features durante la inferencia, controlando el "index rate" para mezclar timbre del target con el contenido fuente.

El entrenamiento se realizó con Applio, batch 8 y chunks de 3 segundos, sobre 439 segmentos de habla de 菠萝吹雪 extraídos manualmente de los episodios 1–5, 7 y 8 de la tercera temporada. Antes del etiquetado se aplicó separación de fuentes con BS-Roformer (`model_bs_roformer_ep_317_sdr_12.9755`) para eliminar música y efectos, y se descartaron las frases con intervenciones de otros personajes para reducir contaminación de timbre. No se documentan etapas de RLHF, DPO ni ajuste por preferencias; es un entrenamiento supervisado de conversión de voz sobre un corpus muy reducido (≈21,6 minutos).

## Capacidades

- Conversión de voz (voice-to-voice) preservando el contenido lingüístico de la fuente y sustituyendo el timbre por el del personaje entrenado.
- Síntesis de voz cantada (covers) con control de transposición tonal mediante cambios de F0.
- Extracción de pitch con rmvpe, adecuada para voces con vibrato y pasajes melódicos.
- Recuperación por índice ContentVec para mejorar la similitud de timbre en inferencia.
- Funciona exclusivamente sobre audio de entrada; no procesa texto ni mantiene contexto conversacional.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- Capacidad multilingüe limitada al chino, idioma de los datos de entrenamiento.
- No dispone de modo "thinking", visión ni audio generativo desde cero.

## Casos de uso

- Covers musicales no comerciales: el modelo convierte una pista vocal en el timbre de 菠萝吹雪; con la voz original en G♯4–B4 conviene bajar 2–4 semitonos y aplicar la misma transposición al instrumental.
- Doblaje amateur de escenas de la serie: se toma el audio de un actor y se transforma al timbre del personaje para parodias o fan films, siempre dentro del ámbito no comercial que fija la model card.
- Creación de contenido para redes: generación de clips cortos con la voz del personaje a partir de grabaciones propias, usando index rate 0.75 y protect 0.33 como parámetros de partida.
- Experimentación con pipelines RVC/Applio: el repositorio sirve como referencia reproducible de un flujo completo (BS-Roformer, etiquetado manual, rmvpe, ContentVec, HiFi-GAN 40k) para quien quiera entrenar sus propios modelos de voz.
- Pruebas de calidad de separación de fuentes: comparar resultados con y sin BS-Roformer sobre el mismo corpus para evaluar la contaminación de timbre en el modelo final.
- Docencia y demostraciones de conversión de voz: ilustrar en talleres las limitaciones de un corpus pequeño (21,6 minutos) y el efecto del index rate en la similitud del timbre.
- Investigación sobre datos escasos en voice conversion: analizar cómo se comporta RVC v2 con 439 segmentos y qué artefactos aparecen en fonemas no vistos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (SDR, MOS, similitud de hablante, error de F0) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repo (0,3 GB) sugiere que los pesos caben holgadamente en GPUs de consumo, pero no se documenta el pico de memoria en ejecución.
- GPU recomendadas: no disponible. Por el tamaño del modelo y el uso de rmvpe + ContentVec, es razonable esperar que funcione en GPUs consumer, aunque el autor no lo especifica.
- ¿Cabe en GPU consumer? No confirmado en la documentación; el tamaño de los artefactos (0,3 GB) es compatible con ello, pero no hay dato oficial.
- Opciones de despliegue: Applio (herramienta de entrenamiento e inferencia citada), y por compatibilidad de formato RVC v2, herramientas del ecosistema RVC que acepten .pth + .index. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guobao-rvc (菠萝吹雪) | RVC v2 | 40 kHz | 439 segmentos, ≈21,6 min, chino | other (no comercial) | Hugging Face, 0 descargas |
| RVC v2 base (público) | RVC v2 | 40/48 kHz | Corpus amplios multilingües | MIT / otras según distribución | Repositorios públicos de RVC |
| Applio (modelos de ejemplo) | RVC v2 / otros | 32–48 kHz | Variable | Según modelo | Repositorio Applio |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido (439 segmentos, ≈21,6 minutos): alta probabilidad de sobreajuste y de artefactos en fonemas, registros y estilos no vistos.
- Sesgo de dominio: solo cubre el registro interpretativo de un personaje de animación infantil; el timbre puede degradarse fuera de ese estilo.
- Riesgo de alucinación audible: en RVC se manifiesta como artefactos, ruido y distorsión en tramos con F0 inestable o con solapamiento de voces.
- Restricción de licencia: la model card indica uso exclusivo de entretenimiento y no comercial; el uso comercial requiere autorización expresa del autor.
- Posible conflicto de derechos: los datos derivan de una obra audiovisual ajena (果宝特攻3); la licencia del modelo no aclara la titularidad sobre el audio original.
- Idioma limitado al chino; no se documenta soporte para otras lenguas.
- Sin métricas publicadas de calidad (MOS, similitud de hablante, SDR); la evaluación es subjetiva.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- No apto para producción en entornos que exijan trazabilidad de licencia o calidad medida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yutengz/guobao-rvc
- Ejemplos de covers del autor: https://huggingface.co/yutengz/rvc-fun-covers/tree/main/covers/菠萝吹雪
- Applio (herramienta de entrenamiento citada): no disponible enlace directo en la información proporcionada
- BS-Roformer (`model_bs_roformer_ep_317_sdr_12.9755`): no disponible enlace directo en la información proporcionada
- Paper de RVC: no disponible en la información proporcionada
- Paper de ContentVec: no disponible en la información proporcionada
