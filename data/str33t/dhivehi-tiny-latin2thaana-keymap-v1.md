# str33t/dhivehi-tiny-latin2thaana-keymap-v1

## Resumen

dhivehi-tiny-latin2thaana-keymap-v1 es un modelo de transliteración de 9 millones de parámetros desarrollado por str33t que convierte texto en dhivehi escrito con caracteres latinos al sistema de escritura Thaana. Se trata de un encoder-decoder a nivel de byte basado en la arquitectura ByT5, entrenado desde cero y destilado a partir de un fine-tune de ByT5 de 300 millones de parámetros. El modelo se distribuye en formato ONNX cuantizado y está pensado para ejecutarse íntegramente en el navegador mediante Transformers.js y WebAssembly, con una descarga de 9,6 MB y una latencia de 35 ms por frase en una CPU de portátil.

Su relevancia radica en ofrecer una alternativa ligera y privada a los modelos servidos por GPU, manteniendo una precisión de caracteres comparable a la del modelo de 300M del que procede. Además, al ejecutarse en el dispositivo, no envía texto a ningún servidor, lo que resulta especialmente útil para aplicaciones web que manejan datos sensibles o para entornos con conectividad limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5 (encoder-decoder byte-level) |
| Parametros totales | 9 millones (9M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8 (ONNX cuantizado), fp16 |
| Idiomas soportados | Dhivehi (dv), entrada en alfabeto latino y salida en Thaana |
| Licencia | MIT |
| Formato de pesos | ONNX (cuantizado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ByT5, un encoder-decoder que opera directamente sobre bytes en lugar de subpalabras, lo que resulta adecuado para tareas de transliteración donde la correspondencia entre grafemas es casi uno a uno. Con solo 9 millones de parámetros, se entrenó desde cero y luego se destiló a partir de un fine-tune de ByT5-small de 300M (str33t/dhivehi-byt5-latin2thaana-keymap-v1). El tokenizer utilizado es el ByT5 estándar de google/byt5-small, y la salida se decodifica mediante un keymap que mapea los caracteres ASCII a Thaana.

El entrenamiento se realizó en tres etapas: la primera solo con noticias, la segunda con aumento de datos y la tercera mediante destilación del modelo grande. El dataset principal es alakxender/dhivehi-transliteration-pairs, cuyo split de test contiene 37.582 filas. Además, se utilizó un corpus de texto de chat en dhivehi latino con 102 frases verificadas por humanos. La innovación técnica destacable es el diseño de la representación alrededor del sistema de escritura, descrito en el paper "Shaped by the Script: Designing the Representation Around the Writing System for Efficient Low-Resource Transliteration", que busca optimizar el modelo para entradas cortas y salidas basadas en un keymap.

## Capacidades

- Transliteración de texto en dhivehi desde escritura latina a Thaana, con entrada a nivel de byte y salida mediante keymap.
- Ejecución completamente local en el navegador gracias a Transformers.js, ONNX Runtime y WebAssembly, sin necesidad de servidor.
- Descarga ligera de 9,6 MB, lo que permite una carga inicial rápida y un funcionamiento fluido en dispositivos móviles.
- Modo fp16 opcional para navegadores con WebGPU, que acelera la inferencia en GPU.
- Soporte de generación con beam search (num_beams=4) y decodificación con caché integrada en el decoder fusionado.
- No soporta tool calling, agentes ni multimodalidad; su función es exclusivamente la transliteración de dhivehi.

## Casos de uso

- Editor de texto en navegador con transliteración en tiempo real: el modelo se carga una vez (9,6 MB) y transforma cada palabra escrita en latino a Thaana en menos de 40 ms, sin latencia de red ni envío de datos a servidores.
- Aplicación de chat para hablantes de dhivehi: el test de chat muestra una precisión de palabra de 0,804, lo que lo hace adecuado para convertir mensajes escritos en latino al alfabeto Thaana de forma automática.
- Herramienta de accesibilidad para leer noticias: los titulares en latino se convierten a Thaana localmente, preservando la privacidad del usuario y funcionando incluso sin conexión tras la primera carga.
- Integración en una PWA para uso sin conexión: al ejecutarse en WebAssembly, la aplicación puede funcionar en zonas con mala cobertura o en aviones, una vez que el modelo queda cacheado en el navegador.
- Componente de preprocesamiento en un pipeline de traducción automática: se puede usar para normalizar la ortografía de textos dhivehi antes de alimentar un modelo de traducción de mayor tamaño.
- Recurso educativo para aprender el sistema Thaana: los estudiantes pueden introducir palabras en latino y ver la transcripción al instante, con una respuesta en menos de 50 ms en portátiles.

## Benchmarks y rendimiento

Los resultados presentados en la model card comparan el modelo de 9M con el fine-tune de ByT5 de 300M y con las etapas intermedias del entrenamiento:

| Sistema | Parámetros | Test de noticias (exact / char acc) | Test de chat (char / word acc) | Entradas de una palabra | Latencia por frase |
|---|---|---|---|---|---|
| dhivehi-tiny (stage 3, destilado) | 9M | 0,286 / 0,919 | 0,920 / 0,804 | 4/4 | 35 ms, CPU navegador |
| Misma arquitectura, stage 1 (solo noticias) | 9M | 0,302 / 0,925 | 0,884 / 0,784 | 1/4 | 40 ms, CPU navegador |
| Misma arquitectura, stage 2 (+aumento) | 9M | 0,282 / 0,912 | 0,880 / 0,768 | 4/4 | 43 ms, CPU navegador |
| dhivehi-byt5-latin2thaana-keymap-v1 (300M, servido) | 300M | 0,247 / 0,919 | 0,955 / 0,797 | 4/4 | 356 ms, GPU |

El exact match tiene un techo bajo en el test de noticias porque muchas filas de referencia no son transliteraciones exactas del original, sino titulares distintos. Por ello, la precisión de caracteres es la métrica más fiable para comparar el rendimiento.

## Requisitos de hardware

- VRAM: no requiere VRAM dedicada para la ruta q8 en navegador; el modelo completo pesa 9,6 MB. Para la ruta fp16 se necesita un navegador con WebGPU, pero no se especifica un consumo de VRAM concreto.
- GPU recomendadas: ninguna para la ruta q8, ya que se ejecuta en CPU mediante WebAssembly. Para fp16, cualquier GPU compatible con WebGPU. El modelo de 300M de referencia sí requiere una GPU para servirse.
- Cabe en cualquier GPU de consumo: sí, al tratarse de 9M de parámetros, su footprint es mínimo.
- Opciones de despliegue: Transformers.js en navegador, ONNX Runtime en Python con optimum, y un servidor estático con cabeceras COOP/COEP para habilitar WebAssembly multihilo.
- Latencia y throughput: 35 ms por frase en CPU de portátil con WebAssembly; 40-43 ms en otras etapas de entrenamiento; 356 ms en GPU para el modelo de 300M.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión de caracteres (test noticias) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dhivehi-tiny-latin2thaana-keymap-v1 | 9M | no disponible | 0,919 | MIT | ONNX, HuggingFace |
| dhivehi-byt5-latin2thaana-keymap-v1 | 300M | no disponible | 0,919 | MIT | HuggingFace |

Ambos modelos se centran en la transliteración dhivehi latino-Thaana. El modelo de 9M ofrece la misma precisión de caracteres que el de 300M en el test de noticias, con una latencia mucho menor y la ventaja de ejecutarse en el navegador sin servidor. No se conocen otros modelos comparables en el Hub para esta tarea específica.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible.
- Riesgo de alucinación: al ser una tarea de transliteración, el modelo puede producir salidas incorrectas en casos ambiguos o con palabras fuera de distribución. El exact match es bajo (0,286) en el test de noticias, lo que indica que muchas salidas no coinciden exactamente con la referencia.
- Limitaciones de contexto o idioma: solo soporta dhivehi y únicamente la dirección latino a Thaana. No soporta otros idiomas ni la transliteración inversa.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, sin restricciones significativas.
- Caveat para producción: el modelo está optimizado para entradas cortas (palabras o frases), no para textos largos. Además, el test split de noticias contiene referencias que no son transliteraciones exactas, por lo que el exact match no debe interpretarse como una medida directa de calidad.

## Enlaces

- HuggingFace: https://huggingface.co/str33t/dhivehi-tiny-latin2thaana-keymap-v1
- Paper: https://huggingface.co/str33t/dhivehi-tiny-latin2thaana-keymap-v1/blob/main/paper/small-enough-for-the-browser.pdf
- GitHub (demo y evaluación): https://github.com/streetsolider/div-transliteration-web
- GitHub (aplicación en producción): https://github.com/streetsolider/div-transliteration
- Demo en vivo: https://streetsolider.github.io/div-transliteration-web/
- Dataset: https://huggingface.co/datasets/alakxender/dhivehi-transliteration-pairs
- Modelo de referencia (300M): https://huggingface.co/str33t/dhivehi-byt5-latin2thaana-keymap-v1
