# Supernova11c/Supernova-Nepali-Normalizer-V2

## Resumen

Supernova Nepali Normalizer V2 es un sistema de normalizacion de texto en nepalí y nepalí-inglés mixto, desarrollado por Supernova11c. A diferencia de los modelos de lenguaje neuronales, este componente es completamente determinista y basado en reglas: no utiliza pesos neuronales, no requiere GPU ni frameworks de deep learning, y ejecuta transformaciones explícitas sobre el texto de entrada. Su objetivo es limpiar inconsistencias Unicode, caracteres de ancho cero, variantes de puntuación y espacios, preservando a la vez URLs, correos electrónicos, emojis y el contenido mixto nepalí-inglés.

La relevancia de esta herramienta radica en su papel como capa de preprocesamiento para pipelines de PLN en nepalí, un idioma con escasos recursos digitales normalizados. V2 se presenta como un componente ligero, rápido y predecible, validado sobre 9.112 muestras de texto (aproximadamente 936K caracteres), con una velocidad de procesamiento de unos 12.490 muestras por segundo en CPU estándar. Su licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema determinista basado en reglas (no neuronal) |
| Parametros totales | No aplicable (no hay pesos entrenados) |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable (procesa texto de entrada completo) |
| Tipos de cuantizacion | No aplicable (no requiere cuantizacion) |
| Idiomas soportados | Nepalí (ne), con preservación de texto mixto nepalí-inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplicable (codigo fuente Python, sin pesos) |

## Arquitectura y entrenamiento

V2 no es un modelo entrenado. Es un sistema de normalización determinista que aplica reglas explícitas definidas en código. Las transformaciones incluyen: normalización Unicode NFC, limpieza de caracteres de ancho cero (U+200C y U+200D), normalización de espacios, saltos de línea y tabulaciones, y normalización de variantes de puntuación (por ejemplo, convierte em dash y en dash en guiones simples, y comillas tipográficas en comillas rectas). No realiza corrección ortográfica basada en contexto ni genera texto nuevo.

El desarrollo se validó sobre 9.112 muestras de texto con aproximadamente 936K caracteres, con resultados: 0 fallos UTF-8, 0 fallos NFC, 0 salidas vacías y 17/17 pruebas de estrés superadas. La velocidad reportada es de aproximadamente 12.490 muestras por segundo en el entorno de desarrollo (Google Colab Free Tier, CPU compartida). No hay datos sobre dataset de entrenamiento porque no existe entrenamiento; el dataset referenciado (Supernova11c/Supernova-teraillm) se menciona en la model card pero no se especifica su uso en V2.

## Capacidades

- Normalización Unicode NFC para texto nepalí.
- Eliminación de caracteres de ancho cero (U+200C, U+200D) en posiciones no deseadas.
- Normalización de espacios en blanco, saltos de línea y tabulaciones.
- Normalización de puntuación común: em dash y en dash a guion simple, comillas tipográficas a comillas rectas.
- Preservación de URLs, correos electrónicos y emojis.
- Preservación de texto mixto nepalí-inglés.
- Procesamiento 100% local, sin dependencias externas ni conexión a internet.
- Ejecución en CPU estándar sin GPU ni frameworks de deep learning.
- Comportamiento determinista y predecible: solo aplica las reglas definidas explícitamente.

## Casos de uso

- Preprocesamiento de datos para entrenamiento de modelos PLN en nepalí: limpiar corpus antes de tokenización o inferencia, reduciendo ruido Unicode y variantes de puntuación.
- Limpieza de datos extraídos de redes sociales o foros: normalizar texto nepalí informal con espacios irregulares, caracteres de ancho cero y puntuación inconsistente antes de análisis posterior.
- Capa de seguridad alrededor de normalizadores neuronales: usar V2 como filtro determinista antes o después de un modelo basado en aprendizaje, garantizando que las salidas mantengan un formato consistente.
- Componente en pipelines de atención al cliente en nepalí: normalizar mensajes de usuarios antes de pasarlos a un sistema de clasificación o generación de respuestas.
- Preparación de datos para motores de búsqueda o indexación: unificar variantes de texto nepalí para mejorar la coincidencia de consultas.
- Preprocesamiento en sistemas de traducción automática: limpiar el texto fuente nepalí para reducir errores debidos a inconsistencias Unicode.

## Benchmarks y rendimiento

La información disponible no incluye benchmarks comparativos con otros modelos (no existen modelos equivalentes neuronales para esta tarea). Los datos de validación reportados por el autor son:

| Metrica | Resultado |
|---|---|
| Muestras de validación | 9.112 |
| Caracteres totales | ~936K |
| Fallos UTF-8 | 0 |
| Fallos NFC | 0 |
| Salidas vacías | 0 |
| Pruebas de estrés superadas | 17/17 |
| Velocidad de procesamiento | ~12.490 muestras/seg |

Además, se menciona una métrica de "detección y procesamiento de idioma" de 1.237.070.359+ caracteres/segundo, aunque no se detalla la metodología de medición. No se han publicado resultados de benchmarks comparativos en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU, por lo que no aplica VRAM.
- CPU: cualquier procesador estándar; el autor reporta pruebas en Google Colab Free Tier (CPU compartida).
- RAM: huella de memoria ultrabaja (no se especifica cifra exacta, pero al ser un script Python sin modelos, es mínima).
- GPU: no necesaria.
- Despliegue: se ejecuta como codigo Python local. No requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia: extremadamente baja; la velocidad reportada es de ~12.490 muestras/seg en el entorno de desarrollo.
- Throughput: dependiente del hardware, pero en CPU estándar se procesan miles de muestras por segundo.

## Comparativa con modelos similares

No se dispone de información sobre normalizadores nepalíes comparables en la documentación proporcionada. Dado que V2 es un sistema determinista sin pesos neuronales, no es directamente comparable con modelos de lenguaje de propósito general. Se puede considerar que su alternativa más cercana sería un script de expresiones regulares o una librería de normalización Unicode estándar, pero no se dispone de datos objetivos de comparación. Por tanto: no disponible.

## Limitaciones y advertencias

- No realiza corrección ortográfica basada en contexto: solo aplica reglas mecánicas; errores semánticos o gramaticales no se corrigen.
- Limitado a normalización de caracteres y puntuación; no entiende el significado del texto.
- El alcance de las reglas es explícito y limitado: cualquier variante no contemplada en las reglas no será normalizada.
- No se especifica soporte para otros idiomas además del nepalí (aunque preserva texto inglés mezclado).
- La métrica de velocidad "1.237.070.359+ caracteres/seg" carece de metodología publicada y debe interpretarse con cautela.
- Al ser un proyecto de un único autor con pocas descargas (8) y sin comunidad amplia, el soporte y mantenimiento a largo plazo no están garantizados.
- No hay evidencia de pruebas en entornos de producción a gran escala más allá de la validación reportada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Supernova11c/Supernova-Nepali-Normalizer-V2
- Dataset referenciado: https://huggingface.co/datasets/Supernova11c/Supernova-teraillm
