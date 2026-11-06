# vivekharry/bohok-indic-translation

## Resumen

BOHOK pilot checkpoint es un modelo de traducción automática desarrollado por el equipo de investigación BOHOK (publicado por el usuario vivekharry) como prueba de concepto para lenguas indígenas del noreste de la India con pocos recursos digitales. Se trata de un T5 encoder-decoder de aproximadamente 3,8 millones de parámetros, entrenado desde cero con inicialización aleatoria y un tokenizador a nivel de byte (`ByT5Tokenizer`), sin partir de ningún modelo preentrenado como IndicTrans2, NLLB o ByT5-small.

El modelo cubre siete lenguas objetivo (kokborok, garo, mundari, santali, bodo, mizo y meitei) con el inglés como lengua pivote, y se entrenó exclusivamente con pares de frases del corpus Google SMOL (CC-BY-4.0) durante 3.396 pasos en CPU, sin GPU. Su relevancia es metodológica más que práctica: sirve como línea base negativa reproducible para investigar curación de datos y arneses de evaluación en entornos de bajos recursos.

Los resultados publicados son muy bajos (BLEU entre 0,0698 y 0,1680 según la lengua) y el propio autor advierte que las salidas degeneran en palabras funcionales repetidas. No es un traductor utilizable en producción ni para comunicación real; es un experimento de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder con tokenizador a nivel de byte (`ByT5Tokenizer`) |
| Parametros totales | ~3,8 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, trp (kokborok), grt (garo), unr (mundari), sat (santali), brx (bodo), lus (mizo), mni (meitei) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer T5 encoder-decoder completo, inicializado de forma aleatoria y con un tokenizador a nivel de byte (`ByT5Tokenizer`), lo que evita depender de un vocabulario preentrenado y permite representar cualquier script sin tokens fuera de vocabulario. El tamaño es de aproximadamente 3,8 millones de parámetros, muy por debajo de los T5 estándar, lo que lo sitúa en la categoría de modelo piloto o de juguete para experimentación.

El entrenamiento se realizó exclusivamente con pares de frases del corpus Google SMOL (CC-BY-4.0), usando los ficheros `*_*_en` del registro de datasets de BOHOK, con el inglés como lado original (`is_src_orig=false`). No se añadieron ficheros inversos, no se usó GATITOS ni Samanantar. Se ejecutaron 3.396 pasos en CPU (4 núcleos, sin GPU), semilla 42, alcanzando una pérdida de validación mínima de 2,12. La evaluación usó decodificación greedy y prefijo de identificador de lengua en la cadena de origen (`kokborok: `, etc.). No hubo RLHF, DPO ni ajuste fino desde modelos preentrenados.

## Capacidades

- Traducción de texto entre inglés y siete lenguas del noreste de la India: kokborok (latín), garo (latín), mundari (devanagari), santali (ol chiki), bodo (devanagari), mizo (latín) y meitei (meitei mayek).
- Tokenización a nivel de byte, lo que permite procesar scripts diversos sin vocabulario predefinido.
- Condicionamiento por identificador de lengua mediante prefijo en el texto de entrada.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada a las ocho lenguas del corpus de entrenamiento.

## Casos de uso

- Reproducción de la línea base negativa: el checkpoint permite replicar el experimento piloto en CPU y comparar futuros ajustes finos contra este punto de partida, tal como indica el autor en la sección de uso previsto.
- Investigación en curación de datos: sirve para estudiar cómo afecta la composición del corpus SMOL y la ausencia de datos inversos al rendimiento en lenguas de bajos recursos.
- Desarrollo de arneses de evaluación: útil para probar pipelines de métricas BLEU y chrF++ con SacreBLEU 2.6.0 sobre particiones agrupadas por documento con semilla 42.
- Estudio de tokenización byte-level: permite analizar el comportamiento de `ByT5Tokenizer` en scripts como ol chiki o meitei mayek sin vocabulario preentrenado.
- Docencia y experimentación académica: adecuado como ejemplo de modelo desde cero con recursos mínimos (4 núcleos de CPU) para ilustrar limitaciones de la inicialización aleatoria.
- Comparación metodológica: sirve como referencia para contrastar con modelos OPUS-MT o IndicTrans2 en trabajos sobre traducción de lenguas minoritarias, siempre que se explicite que sus métricas no son comparables directamente.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre frases reservadas de SMOL (hasta 40 por lengua), SacreBLEU 2.6.0, decodificación greedy. COMET no se ejecutó.

| Lengua | BLEU | chrF++ |
|---|---|---|
| Bodo | 0,1680 | 6,5293 |
| Garo | 0,0974 | 5,3811 |
| Kokborok | 0,0698 | 4,8828 |
| Meitei | 0,1678 | 6,2282 |
| Mizo | 0,0914 | 5,2372 |
| Mundari | 0,0839 | 5,9302 |
| Santali | 0,1605 | 6,1771 |

El autor aporta como contexto, no como resultado de este checkpoint, que OPUS-MT sin modificar obtuvo en una muestra distinta de 40 frases de OPUS-100: bengalí BLEU 22,58 / chrF++ 44,22 y marathi BLEU 27,32 / chrF++ 39,29. No existe comparación con Google Translate.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB dada la carga de ~3,8 millones de parámetros; el autor entrenó y evaluó en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es sobradamente suficiente.
- Cabe en cualquier GPU consumer e incluso en CPU de 4 núcleos, según la configuración de entrenamiento reportada.
- Opciones de despliegue: el formato safetensors es compatible con la librería `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BOHOK pilot checkpoint | ~3,8 M | no disponible | CC-BY-4.0 | Hugging Face | Entrenado desde cero, BLEU 0,07-0,17 |
| IndicTrans2 | no disponible en la información | no disponible | no disponible | no disponible | Mencionado por el autor como modelo del que NO deriva |
| NLLB | no disponible en la información | no disponible | no disponible | no disponible | Mencionado por el autor como modelo del que NO deriva |
| OPUS-MT (Helsinki-NLP) | no disponible en la información | no disponible | no disponible | no disponible | Usado como baseline separado en la app BOHOK; BLEU 22,58-27,32 en bengalí/marathi |

No se dispone de datos suficientes para una comparación cuantitativa directa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo infraentrenado con inicialización aleatoria: las salidas degeneran en palabras funcionales repetidas, según el propio autor.
- No debe usarse para comunicación, educación, salud ni textos gubernamentales.
- No cubre gondi, bhili, kui, khasi, nyishi, karbi, nagamese, tagin ni kokborok en escritura bengalí.
- No se usaron benchmarks externos (IN22, FLORES, WMT) por estar restringidos o no descargados.
- Traduccionalés derivado de bitexto con inglés como original; sin datos inversos.
- Sin vocabulario preentrenado, lo que limita la calidad de la representación.
- Licencia CC-BY-4.0 permite uso comercial con atribución, pero el autor declara explícitamente fuera de alcance el despliegue como servicio de traducción comunitario.
- Riesgo alto de alucinación y de salidas degeneradas; no apto para producción.
- Una puntuación automática baja no juzga a las lenguas, sino a este modelo concreto.

## Enlaces

- Hugging Face: https://huggingface.co/vivekharry/bohok-indic-translation
- Paper citado (SMOL, Caswell et al.): arXiv:2502.12301
- Dataset: google/smol (CC-BY-4.0)
- Código BOHOK: disponible junto al Space del proyecto (Apache-2.0), según la model card
- Repositorio de OPUS-MT (Helsinki-NLP): no disponible en la información proporcionada
