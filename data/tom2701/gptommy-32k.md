# Tom2701/gpTommy-32k

## Resumen

gpTommy-32k es un vocabulario y tokenizer léxico de 32.768 tokens diseñado específicamente para la lengua italiana por Thomas Seri (Sentinel), dentro del ecosistema Sentinel LifeOS y la familia de modelos Sentinel R-08. No se trata de un modelo de lenguaje entrenado, sino del componente de tokenización que sirve de motor léxico a los modelos compactos de dicha familia, como Sentinel R-08 v7 (44,5M de parámetros) y Sentinel R-08 v7.2a (51,6M de parámetros).

El problema que aborda es la fragmentación del texto italiano en los tokenizers BPE calibrados sobre inglés (GPT-4, LLaMA, Mistral), que parten palabras como «cuscinetto» o «manutenzione» en tres o cuatro subtokens arbitrarios. Esto incrementa la longitud efectiva del contexto, el coste computacional y el riesgo de errores ortográficos en la generación. gpTommy-32k propone una codificación determinista en la que el 90,9% del vocabulario (29.775 entradas) corresponde a palabras italianas completas, incluyendo formas flexionadas, conjugaciones verbales y léxico técnico-científico.

La relevancia del proyecto es acotada pero específica: ofrece un tokenizer autónomo sin dependencias externas, con un esquema de identificadores interpretable por categoría, orientado a investigación lingüística y a modelos pequeños de dominio italiano. No hay evidencia publicada de benchmarks del tokenizer ni de su integración en modelos de gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizer léxico determinista con esquema de identificadores `SSvvv` (scheda + fila); no es un modelo neuronal |
| Parámetros totales | no disponible (el artefacto es un vocabulario, no un modelo de parámetros) |
| Parámetros activos | no aplica |
| Longitud de contexto | no disponible (el sufijo "32k" hace referencia al tamaño del vocabulario, no a la ventana de contexto) |
| Tipos de cuantización | no aplica |
| Idiomas soportados | italiano (91% del vocabulario son palabras italianas completas; incluye algunas formas latinas) |
| Licencia | Non-Commercial Research License con restricciones éticas (exclusión de usos bélicos, propaganda y usos lesivos) |
| Formato de pesos | no disponible; se distribuye un script Python `gptommy_tokenizer.py` sin dependencias externas |

## Arquitectura y entrenamiento

El componente no es un transformer ni un modelo neuronal: es un vocabulario léxico con una codificación determinista de cinco cifras `SSvvv`. Las dos primeras cifras (`SS`, de `00` a `26`) identifican la scheda o categoría, que en el rango `01`–`26` corresponde a la letra inicial A–Z. Las tres restantes (`vvv`) identifican la fila o lema dentro de esa scheda. La scheda `00` (IDs `00000`–`00999`) agrupa tokens especiales de chat (`<|user|>`, `<|assistant|>`, `<|system|>`), puntuación, dígitos y símbolos matemáticos.

La ripartición declarada de los 32.768 identificadores es: 29.775 palabras italianas completas (90,9%), 1.925 caracteres individuales, dígitos y símbolos (5,9%) y 1.069 tokens especiales de control y chat (3,2%). El tokenizer se implementa en un único archivo Python autocontenido, sin dependencias de librerías pesadas, con métodos `encode` y `decode`. No se documenta en la información disponible ningún proceso de entrenamiento estadístico, corpus de ajuste, RLHF ni técnica de decodificación asociada.

## Capacidades

- Tokenización y detokenización de texto italiano con asignación de un token atómico por palabra completa en el 90,9% de los casos.
- Cobertura de formas base, singulares, plurales, verbos conjugados y léxico técnico-científico italiano.
- Soporte de tokens especiales de control para plantillas de chat: `<|user|>`, `<|assistant|>`, `<|system|>`.
- Codificación de puntuación, dígitos y operadores matemáticos (`+`, `-`, `=`, `*`, `%`) en la scheda `00`.
- Funcionamiento sin dependencias externas, lo que facilita su integración en entornos restringidos.
- Identificadores interpretables por categoría léxica, lo que permite inspección y depuración directa del vocabulario.
- No dispone de capacidades de generación, razonamiento, tool calling, agentes, visión ni audio por sí mismo; estas dependen del modelo que lo utilice.

## Casos de uso

- Preprocesado de corpus italianos para investigación lingüística: el esquema `SSvvv` permite agrupar estadísticas de frecuencia por letra inicial y por lema, facilitando análisis de cobertura léxica sobre textos técnicos o literarios.
- Entrenamiento de modelos compactos de dominio italiano: los modelos Sentinel R-08 (44,5M y 51,6M de parámetros) emplean este vocabulario como motor léxico, de modo que un equipo puede replicar la configuración para experimentos de bajo coste con vocabulario nativo.
- Reducción de la longitud de secuencia en pipelines de NLP italianos: al mapear palabras completas a un único ID, se reduce el número de tokens por frase frente a tokenizers BPE calibrados en inglés, lo que abarata el cómputo en modelos pequeños.
- Evaluación comparativa de tokenizers: sirve como referencia léxica para medir la fragmentación de tokenizers comerciales sobre un corpus italiano y cuantificar el exceso de tokens por palabra.
- Prototipado de asistentes conversacionales en italiano: los tokens especiales de chat permiten construir plantillas de diálogo multi-turno sin definir un esquema propio.
- Docencia y divulgación sobre tokenización: la correspondencia directa entre ID y categoría gramatical o letra inicial hace el vocabulario inspeccionable, útil para explicar cómo funciona la tokenización sin caja negra.
- Integración en herramientas de corrección ortográfica o normalización léxica: la decodificación determinista permite reconstruir el texto original sin ambigüedad de subtokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona un resultado del modelo asociado Sentinel R-08 v7.2a (82,51% en BLiMP), que no corresponde al tokenizer sino al modelo que lo emplea, y no se aportan métricas de fertilidad, compresión ni cobertura sobre corpus para gpTommy-32k.

## Requisitos de hardware

- El tokenizer es un script Python sin dependencias externas; se ejecuta en CPU y no requiere VRAM.
- No necesita GPU para funcionar: el coste es el de cualquier operación de búsqueda en diccionario sobre 32.768 entradas.
- Cabe en cualquier equipo, incluidos entornos embebidos y contenedores mínimos.
- Opciones de despliegue: importación directa del módulo `gptommy_tokenizer` en Python; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de coste de codificación.

## Comparativa con modelos similares

| Criterio | gpTommy-32k | Tokenizer BPE tipo LLaMA | Tokenizer BPE tipo Mistral |
|---|---|---|---|
| Tipo | Léxico determinista por palabras | BPE estadístico | BPE estadístico |
| Tamaño de vocabulario | 32.768 | ~32.000 | ~32.000 |
| Cobertura de palabras italianas completas | 29.775 (90,9%) | No documentada; fragmentación frecuente | No documentada; fragmentación frecuente |
| Idiomas | Italiano | Multilingüe con sesgo inglés | Multilingüe con sesgo inglés |
| Licencia | Non-Commercial Research License | Según modelo (habitualmente permisiva) | Según modelo (habitualmente permisiva) |
| Dependencias | Ninguna | Librerías de tokenizers | Librerías de tokenizers |
| Uso comercial | Restringido | Habitualmente permitido | Habitualmente permitido |

No se dispone de datos comparativos de fertilidad ni de compresión sobre corpus italiano para ninguno de los tres, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni razona; cualquier expectativa de uso como LLM es incorrecta.
- El sufijo "32k" se refiere al tamaño del vocabulario, no a una ventana de contexto de 32.000 tokens; no debe interpretarse como contexto largo.
- La licencia es Non-Commercial Research License, con restricciones éticas explícitas (exclusión de usos bélicos, propaganda y usos lesivos); el uso en producción requiere contacto con el autor.
- No se documentan sesgos lingüísticos medidos ni evaluación de cobertura sobre corpus reales; la cifra del 90,9% procede de la propia model card y no está verificada de forma independiente.
- El vocabulario está orientado exclusivamente al italiano; no hay soporte declarado para otras lenguas más allá de algunas formas latinas.
- No se especifican el formato de distribución de los pesos, la versión de Python soportada ni pruebas de compatibilidad con frameworks de inferencia estándar.
- El proyecto tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, sin señales de adopción externa.
- La fecha de creación del repositorio (2026-11-02) es posterior a la fecha actual de referencia habitual, lo que conviene verificar antes de citar el recurso.

## Enlaces

- HuggingFace: https://huggingface.co/Tom2701/gpTommy-32k
- Repositorio GitHub del vocabulario: https://github.com/Thomasseri/gpTommy-32k
- Sitio oficial: https://www.sentinelhub.eu
- Modelo Sentinel R-08 v7 (44,5M): https://huggingface.co/Tom2701/R-08 | https://github.com/Thomasseri/R-08
- Modelo Sentinel R-08 v7.2 (51,6M): https://huggingface.co/Tom2701/R-08-v7.2 | https://github.com/Thomasseri/R-08-v7.2
- Modelo Sentinel R-08 v7.2a (51,6M): https://huggingface.co/Tom2701/R-08-v7.2a | https://github.com/Thomasseri/R-08-v7.2a
- Baseline transformer de control (44,9M): https://huggingface.co/Tom2701/R-08-Transformer-Baseline | https://github.com/Thomasseri/R-08-Transformer-Baseline
