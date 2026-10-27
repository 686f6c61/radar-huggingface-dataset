# wordspace/proofreader-0.6B-MLX-6bit

## Resumen

proofreader-0.6B-MLX-6bit es un modelo en miniatura de corrección de estilo desarrollado por wordspace para su aplicación de notas. Se trata de un ajuste fino con LoRA sobre Qwen3-0.6B-Base (596.049.920 parámetros, transformer decoder-only denso), fusionado y cuantizado a 6 bits para MLX, el framework de Apple. Su tarea es acotada y explícita: dada una frase o un párrafo, señalar la expresión prolija o torpe —copiada literalmente del texto— y proponer una alternativa más corta; si el texto está bien, no devuelve nada. Responde con un único objeto JSON y se detiene, tras 17 tokens de media.

No es un corrector ortográfico ni gramatical: cubre solo estilo, es decir, frases verbosas, estilo nominal ("llevar a cabo una inspección de") y redundancias ("repetir otra vez"). Trabaja en italiano, inglés, español, francés, alemán y portugués, y está diseñado para ejecutarse en local mientras el usuario escribe: 0,08 s por frase (mediana) en Apple silicon, según la sonda del autor.

Su interés práctico está en la relación entre tamaño y tarea: con 0,6B supera al generalista gemma-3-4b-it (QAT, 4 bits) en la detección de frases verbosas (74/96 frente a 27/96) sin tocar ninguna frase limpia (0/96 frente a 8/96), con licencia Apache-2.0 y menos de 0,5 GB de pesos. Eso lo hace viable como componente de corrección on-device, siempre que se acepten sus límites: frases fuera de lo aprendido se detectan aproximadamente la mitad de las veces y el alemán es el idioma más débil.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), ajustado con LoRA y fusionado; pesos cuantizados a 6 bits para MLX |
| Parámetros totales | 596.049.920 (aproximadamente 0,6B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-0.6B-Base) |
| Tipos de cuantización | 6 bits, formato MLX (el autor indica que la versión de 6 bits da las mismas respuestas que la de precisión completa dentro del ruido) |
| Idiomas soportados | Italiano (it), inglés (en), español (es), francés (fr), alemán (de), portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors cuantizados para MLX (`library_name: mlx`); repositorio de 0,5 GB |

## Arquitectura y entrenamiento

La base es Qwen3-0.6B-Base, un transformer decoder-only denso de 596 millones de parámetros. Sobre él se aplicó un ajuste fino con LoRA de rango 16 en todas las capas (AdamW, learning rate 1e-4, gradient clipping en norma 1, pérdida calculada únicamente sobre los tokens de la respuesta), seguido de 250 pasos adicionales a 2e-5 en los que cada respuesta se cierra con el token de fin de texto, de modo que el modelo aprenda a detenerse. El adaptador se fusionó en los pesos y el conjunto se cuantizó a 6 bits para MLX.

Los datos de entrenamiento son 24.000 casos sintéticos generados a partir de plantillas escritas a mano en seis idiomas: frases verbosas con sus defectos marcados, las mismas frases ya concisas (pares mínimos, para que el modelo aprenda la formulación y no el tema), notas limpias y párrafos que mezclan ambos tipos. Casi la mitad de los casos no tiene nada que corregir. Una de cada cinco plantillas se reservó solo para validación, y se descartó cualquier caso generado que compartiera ocho palabras consecutivas con una frase de test. El checkpoint se eligió por la métrica de la tarea en validación (frases verbosas encontradas y frases limpias intactas), no por la pérdida. No se usaron notas personales. El protocolo de inferencia exige un system prompt idéntico carácter a carácter, plantilla de chat del tokenizer y decodificación voraz, y el resultado se filtra quedándose solo con las sugerencias cuyo campo `original` aparece literalmente en el texto.

## Capacidades

- Generación de un único objeto JSON con la estructura `{"suggestions": [{"type": "style", "original": ..., "replacement": ...}]}` y parada en el token de fin de texto.
- Detección de frases verbosas: sustitución de perífrasis por formas breves ("Due to the fact that" por "Because").
- Detección de estilo nominal ("carry out an inspection of") y de redundancias ("repeat again").
- Abstención explícita: ante texto limpio no emite sugerencia (0/96 frases limpias tocadas en la sonda del autor; 13/187 en validación retenida).
- Multilingüe en seis idiomas: italiano, inglés, español, francés, alemán y portugués.
- Corrección a nivel de frase y de párrafo corto (varias frases), no de documentos largos.
- Adecuado para ejecución de baja latencia en bucle de teclado (0,08 s por frase en Apple silicon).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extenso.

## Casos de uso

- Corrección de estilo en vivo en una app de notas: el modelo se invoca con debounce sobre la frase en edición, devuelve un JSON de una línea y la interfaz subraya el fragmento original. Es el uso para el que fue entrenado (la app wordspace) y encaja por su latencia de 0,08 s y su tasa de falsos positivos nula en frases limpias de la sonda.
- Extensión de editor de código o de Markdown (VS Code, Obsidian): al ser un modelo de 0,5 GB ejecutable con MLX, el texto no sale del dispositivo, lo que evita enviar notas privadas a una API externa.
- Pretratamiento en un pipeline editorial: pasar cada párrafo por el modelo para marcar candidatos a simplificación antes de la revisión humana, reduciendo el trabajo del editor a validar o descartar sugerencias.
- Linting de prosa en CI de documentación: un script que procese los ficheros `.md` del repositorio, aplique `protocol.style_suggestions` para filtrar sugerencias y falle la build si aparecen patrones prohibidos por la guía de estilo.
- Documentación multilingüe: al cubrir seis idiomas, permite aplicar la misma comprobación de estilo a las traducciones de un mismo producto y detectar estilos nominales heredados del original.
- Asistentes de escritura on-device en macOS/iOS: integración en apps nativas mediante mlx-lm, con el modelo cargado en memoria unificada y sin dependencia de red.
- Investigación sobre modelos pequeños especializados: sirve como referencia reproducible de ajuste con LoRA sobre Qwen3-0.6B con salida estructurada y criterio de selección de checkpoint por métrica de tarea.

## Benchmarks y rendimiento

Sonda escrita a mano de 192 frases, 32 por idioma, nunca usada en entrenamiento: 60 con una frase verbosa conocida por los datos de entrenamiento insertada en oraciones nuevas, 36 con frases verbosas que los datos nunca contienen y 96 notas limpias. Comparación con gemma-3-4b-it (QAT, 4 bits), el modelo que la app usaba para esta tarea, sobre las mismas frases y con el mismo prompt:

| Métrica | proofreader-0.6B (6 bits) | gemma-3-4b (QAT, 4 bits) | p (McNemar exacto) |
|---|---|---|---|
| Frases verbosas encontradas | 74/96 | 27/96 | < 0,001 |
| · frases vistas en entrenamiento, oraciones nuevas | 54/60 | 18/60 | < 0,001 |
| · frases nunca vistas | 19/36 | 9/36 | 0,021 |
| Frases limpias tocadas (el daño) | 0/96 | 8/96 | 0,008 |
| Segundos por frase (mediana, Apple silicon) | 0,08 | 0,64 | — |

Desglose por idioma (frases verbosas encontradas, sobre 16 por idioma): alemán 12 frente a 4, inglés 15 frente a 9, español 9 frente a 3, francés 12 frente a 3, italiano 13 frente a 7, portugués 12 frente a 1. En el test propio de la app (ocho frases verbosas y ocho limpias): 5/8 frente a 3/8, sin que ninguno de los dos tocara una frase limpia. La versión de 6 bits coincide con la de precisión completa dentro del ruido: 74 frente a 73 frases encontradas y 0 frente a 0 limpias tocadas.

El propio autor advierte que la sonda la escribieron las mismas personas que redactaron las plantillas de entrenamiento, por lo que la mitad "frases nunca vistas" (19/36) es la medida más justa de lo aprendido.

## Requisitos de hardware

- Pesos: 596M de parámetros a 6 bits, aproximadamente 0,45 GB; el repositorio ocupa 0,5 GB.
- Memoria necesaria para inferencia: por debajo de 1 GB en total, incluyendo overhead de mlx-lm y el contexto de una nota corta.
- Cabe en cualquier equipo con Apple silicon (M1 o superior), que es el único entorno soportado por el formato publicado. No se distribuyen pesos GGUF ni safetensors estándar para CUDA o ROCm.
- GPU dedicadas tipo A100, H100 o RTX 4090: no aplica al artefacto publicado; para usarlas habría que reconvertir el modelo desde el base, algo no documentado en la información disponible.
- Despliegue: `mlx-lm` (generación en proceso o servidor), con el ejemplo incluido (`example.py`) y los helpers de prompt y filtrado (`protocol.py`). llama.cpp, Ollama, vLLM y TGI no consumen pesos MLX directamente.
- Latencia: 0,08 s por frase (mediana) en Apple silicon, con 17 tokens de salida de media. Throughput agregado y consumo de memoria pico no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| proofreader-0.6B-MLX-6bit | 596M | No disponible | Corrección de estilo con salida JSON, 6 idiomas | Apache-2.0 | safetensors MLX 6 bits (0,5 GB) |
| gemma-3-4b-it (QAT, 4 bits) | Aproximadamente 4B (según el nombre del modelo) | No disponible | Generalista; usada por la app para esta tarea antes del ajuste | No disponible en la información | No disponible |
| Qwen/Qwen3-0.6B-Base | 596M | No disponible | Modelo base generalista, sin ajuste de estilo | Apache-2.0 | safetensors |

Frente a gemma-3-4b, el modelo ajustado gana en las tres métricas medidas (74/96 frente a 27/96 en detección, 19/36 frente a 9/36 en frases no vistas, 0/96 frente a 8/96 en falsos positivos) siendo aproximadamente 6,7 veces menor en parámetros y 8 veces más rápido por frase en el mismo hardware. Frente a su modelo base, la diferencia es de especialización: Qwen3-0.6B-Base no produce el formato JSON ni la abstención ante texto limpio sin un ajuste adicional.

## Limitaciones y advertencias

- Solo estilo: no está entrenado para corregir ortografía ni gramática y se espera que las deje intactas; pedirle esas tareas queda fuera de su distribución de entrenamiento.
- Frases fuera de lo aprendido: se detectan aproximadamente la mitad de las veces (19/36) y la sustitución propuesta a menudo no es la que elegiría un editor cuidadoso. Las sugerencias deben tratarse como tales.
- Falsos positivos en validación retenida: toca el 7 % de las notas limpias (13/187), con un 14 % en párrafos de varias frases. El alemán es el idioma más débil con diferencia: 10 de 38 casos limpios tocados, frente a 0 en inglés, francés, italiano y portugués y 3 de 26 en español.
- Longitud: entrenado con notas cortas (frases y párrafos de pocas frases); no hay validación sobre documentos largos ni sobre textos con estructura compleja.
- Dependencia estricta del protocolo: el system prompt debe reproducirse carácter a carácter, hay que aplicar la plantilla de chat del tokenizer, generar de forma voraz y parsear el primer objeto JSON. Cualquier desviación invalida el comportamiento descrito.
- Sesgo de evaluación: la sonda de 192 frases fue escrita por el mismo equipo que redactó las plantillas de entrenamiento, y el propio autor señala que el subconjunto de frases nunca vistas es la medida más fiable.
- Naturaleza de modelo base ajustado: no es un asistente conversacional; usado en formato abierto puede generar texto incoherente o inventar contenido, ya que el ajuste solo refuerza la tarea de estilo.
- Cobertura lingüística limitada a seis idiomas; no hay datos para ninguna otra lengua.
- Licencia Apache-2.0, que permite uso comercial y modificación, pero conviene verificar el fichero `NOTICE` del repositorio con la lista completa de cambios antes de redistribuir.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wordspace/proofreader-0.6B-MLX-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Aplicación wordspace: https://getwordspace.com
- Ficheros incluidos en el repositorio: `example.py`, `protocol.py`, `NOTICE`
- Dependencia de ejecución: `mlx-lm` (instalación vía `pip install mlx-lm`, indicada en la model card)
