# udgamlabs/Paar-en-as

## Resumen

Paar English → Assamese es un modelo de traducción automática neuronal especializado en la dirección inglés → asamés, desarrollado por Udgam Labs. Se trata de un modelo MarianMT con 17,17 millones de parámetros, diseñado explícitamente para ser extremadamente ligero: el archivo int8 ocupa 17,7 MB (19,7 MB con el vocabulario) y puede ejecutarse sin conexión en una CPU convencional a unos 34 ms por frase en un solo hilo, o incluso dentro de un navegador web mediante transformers.js. Resuelve el problema de la traducción inglés-asamés en entornos con recursos muy limitados, donde los modelos de traducción multilingües de gran tamaño resultan inviables.

El modelo se destila a partir de IndicTrans2 (concretamente de las traducciones que produjo IndicTrans2 dist-200M), lo que le permite aprender de un corpus de alta calidad con una fracción del coste computacional. Forma parte de una familia de doce modelos de Udgam Labs para traducción del inglés a lenguas indias (hindi, bengalí, maratí, telugu, tamil, gujarati, urdu, cananeo, malabar, panyabí, odia y asamés), todos ellos con el mismo enfoque de eficiencia extrema.

Su relevancia actual radica en que cubre un hueco que ni siquiera Firefox resuelve con un modelo offline de inglés a asamés, y lo hace con un coste de descarga de un orden de magnitud inferior al de alternativas como indicMT (153,8M parámetros, 169,2 MB en int8). Aunque queda por detrás de indicMT en calidad (1,51 chrF++ en FLORES+ y 2,13 en IN22-Conv), su relación tamaño/rendimiento lo hace adecuado para despliegues en dispositivos, navegadores y sistemas embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder, text2text-generation) |
| Parametros totales | 17.170.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entradas truncadas a 127 piezas SentencePiece, salida hasta 200 tokens |
| Tipos de cuantizacion | int8 (CTranslate2 y ONNX), fp32 (pesos originales) |
| Idiomas soportados | inglés (en), asamés (as) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), CTranslate2 int8, ONNX int8 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura MarianMT, un transformer encoder-decoder estándar para traducción automática, con 17,17 millones de parámetros totales. Los pesos se distribuyen en formato safetensors para su uso con la librería transformers, y se ofrecen builds optimizados en CTranslate2 int8 (para CPU) y ONNX int8 (para transformers.js en navegador y Node). La tokenización se realiza con SentencePiece, con un límite práctico de 127 piezas por frase de entrada.

El entrenamiento se basa en destilación desde IndicTrans2 dist-200M: el modelo aprendió a partir de frases en inglés que IndicTrans2 había traducido al asamés. El corpus de referencia citado es ai4bharat/IndicCorpV2. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica principal no reside en la arquitectura, sino en la compresión extrema del modelo manteniendo una calidad competitiva: el build CTranslate2 int8 obtiene 0,00 chrF++ de diferencia respecto a los pesos fp32 en FLORES+, con un 79% de traducciones idénticas palabra por palabra, y el build ONNX int8 queda a 0,07 chrF++ de los pesos fp32 en ambos conjuntos de test.

## Capacidades

- Traducción de texto de inglés a asamés, en escritura bengalí con caracteres asameses específicos (ৰ, ৱ).
- Generación de texto secuencial frase a frase; requiere dividir párrafos en frases antes de la inferencia.
- Decodificación greedy (num_beams=1) como configuración evaluada y recomendada; la búsqueda por haz (beam search) no fue probada.
- Ejecución offline en CPU de un solo hilo (unos 34 ms por frase en un Mac mini) y en navegador web mediante transformers.js.
- Soporte de tres vías de despliegue: transformers (Python, fp32), CTranslate2 (Python, int8, CPU) y transformers.js (JavaScript, ONNX int8, navegador o Node).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo thinking; es un modelo puramente de traducción.
- Capacidad multilingüe limitada a un único par de idiomas (en → as).

## Casos de uso

- Traducción en navegador sin conexión: integrado con transformers.js, el modelo permite traducir inglés a asamés directamente en el cliente web (Firefox, Chrome, etc.) sin enviar texto a un servidor, gracias a sus 28,8 MB de archivos int8 descargados una sola vez. Es adecuado para aplicaciones de privacidad estricta o conectividad intermitente.
- Traducción en dispositivos de gama baja o embebidos: con 17,7 MB en int8 y ejecución en un solo hilo de CPU a 34 ms por frase, puede desplegarse en Raspberry Pi, routers, televisores inteligentes o terminales de punto de venta para localización de interfaces y mensajes.
- Localización de documentación y contenido web: traducción por lotes de frases individuales (dividiendo párrafos previamente) en pipelines de CI/CD para generar versiones en asamés de páginas de ayuda, avisos legales o menús de aplicaciones.
- Atención al cliente automatizada en asamés: integración en chatbots o sistemas de respuesta automática que reciben consultas en inglés y deben responder en asamés, con latencia de decenas de milisegundos por frase y sin dependencia de GPU.
- Herramientas de accesibilidad y lectura: traducción al vuelo de subtítulos, correos o notificaciones del inglés al asamés en aplicaciones de escritorio o móviles, aprovechando la velocidad de CTranslate2 int8 en CPU.
- Investigación en traducción automática de bajos recursos: modelo de referencia para experimentos de destilación, cuantización y evaluación en lenguas indias con presupuesto computacional mínimo, dado su tamaño reducido y su licencia Apache 2.0.
- Procesamiento por lotes de corpus: traducción masiva de frases en servidores sin GPU, con un rendimiento aproximado de 200 frases por segundo según la model card (dato parcial en la información disponible), adecuado para preprocesar datasets o generar memorias de traducción.

## Benchmarks y rendimiento

Los resultados publicados emplean chrF++ (mayor es mejor), con NFC en ambos lados, el mismo harness y las mismas frases para todos los sistemas. Las diferencias son pareadas con 1.000 remuestreos bootstrap e intervalo de confianza al 95%. Medición realizada entre el 3 y el 16 de noviembre de 2026. Las puntuaciones de Paar corresponden a los pesos fp32; el build int8 queda a 0,07 chrF++ de ellos.

| Conjunto de test (frases) | Paar (17,3M) | indicMT (153,8M) | IndicTrans2 dist-200M (211,8M) |
|---|---:|---:|---:|
| FLORES+ devtest (1.012) | 39,90 | 41,42 (-1,51 [-1,94, -1,09]) | 42,05 |
| IN22-Conv (1.503) | 42,57 | 44,70 (-2,13 [-2,72, -1,59]) | 42,70 |
| IN22-Gen | 41,81 | no disponible | no disponible |

Datos adicionales de rendimiento:
- Números conservados (frases en las que sobrevive cada número): 93,4% en FLORES+ y 92,8% en IN22-Conv.
- Tamaño: carpeta int8 de 19,7 MB; archivos ONNX int8 para navegador de 28,8 MB; indicMT int8 ocupa 169,2 MB.
- Velocidad: aproximadamente 34 ms por frase en un hilo de CPU (CTranslate2 int8, mediana) en un Mac mini, y unas 200 frases por segundo (dato parcial en la información disponible).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo está pensado para CPU. En GPU, los pesos fp32 (unos 68 MB) caben en cualquier GPU con más de 1 GB de VRAM; el build int8 requiere menos de 20 MB.
- GPU recomendadas: no son necesarias. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) puede ejecutarlo, pero el diseño apunta a CPU.
- CPU: funciona en un solo hilo de CPU convencional (medido en un Mac mini a 34 ms por frase con CTranslate2 int8). Cabe en cualquier consumer CPU, incluidos dispositivos de bajos recursos.
- Cabe en GPU consumer: sí, en todas, aunque no es el escenario objetivo.
- Opciones de despliegue: transformers (Python, fp32), CTranslate2 (Python, int8, CPU), transformers.js (JavaScript, ONNX int8, navegador o Node). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: aproximadamente 34 ms por frase en un hilo de CPU (CTranslate2 int8, mediana) y unas 200 frases por segundo (dato parcial). En navegador, la latencia depende del dispositivo; los archivos int8 son 28,8 MB descargados una vez.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | FLORES+ (chrF++) | IN22-Conv (chrF++) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Paar English → Assamese | 17,3M | entradas de 127 piezas, salida 200 tokens | 39,90 | 42,57 | Apache 2.0 | Hugging Face, CTranslate2, ONNX, transformers.js |
| indicMT | 153,8M | no disponible | 41,42 | 44,70 | no disponible | Hugging Face (int8: 169,2 MB) |
| IndicTrans2 dist-200M | 211,8M | no disponible | 42,05 | 42,70 | no disponible | Hugging Face |
| Modelo offline de Firefox (en→as) | no disponible | no disponible | no disponible | no disponible | no disponible | Firefox (no existe modelo en→as según la model card) |

Paar es entre 8,6 y 12 veces más pequeño que indicMT e IndicTrans2 dist-200M, con una calidad inferior de 1,51 y 2,13 chrF++ frente a indicMT en FLORES+ e IN22-Conv respectivamente, y ligeramente por debajo de IndicTrans2 dist-200M en FLORES+ (2,15 puntos) aunque por encima en IN22-Conv (0,13 puntos). Su ventaja principal es el tamaño (19,7 MB int8 frente a 169,2 MB de indicMT) y la capacidad de ejecución en navegador y CPU sin conexión.

## Limitaciones y advertencias

- Calidad inferior a modelos más grandes: queda 1,51 chrF++ por detrás de indicMT en FLORES+ y 2,13 en IN22-Conv, con intervalos de confianza pareados que no incluyen el cero.
- Las traducciones de ejemplo de la model card son salidas sin editar, con errores incluidos, y ningún hablante nativo las ha revisado; pueden contener fallos gramaticales o de elección léxica.
- Procesa una sola frase por entrada y trunca las entradas a 127 piezas SentencePiece; es necesario dividir párrafos en frases antes de la inferencia, lo que puede degradar la coherencia en textos largos.
- Solo se evaluó decodificación greedy (num_beams=1); el comportamiento con beam search no está probado.
- Modelo unidireccional (inglés → asamés) y monolingüe en el par; no soporta otras direcciones ni otros idiomas.
- Riesgo de alucinación y de omisión o alteración de números: la tasa de números conservados es del 93,4% en FLORES+ y 92,8% en IN22-Conv, por lo que aproximadamente 1 de cada 14 frases pierde o modifica algún número.
- No se dispone de información sobre sesgos demográficos, culturales o de género en el corpus de entrenamiento (IndicCorpV2 e IndicTrans2); se recomienda evaluación específica antes de uso en producción sensible.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe conservar el aviso de licencia y no se ofrece garantía; conviene verificar las condiciones de los datos de destilación (IndicTrans2) para usos derivados.
- El modelo no incluye mecanismos de seguridad, filtrado de contenido ni moderación; en aplicaciones de cara al usuario se requiere una capa adicional.
- Los builds int8 introducen pequeñas diferencias: CTranslate2 int8 iguala a fp32 en FLORES+ (0,00 chrF++) con un 79% de traducciones idénticas, y ONNX int8 queda a 0,07 chrF++; no se garantiza paridad exacta en todos los casos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/Paar-en-as
- Demo en navegador (Space): https://huggingface.co/spaces/udgamlabs/Paar
- Código y receta de fine-tuning: https://github.com/udgamlabs/paar
- Modelos hermanos de la familia Paar: [en-hi](https://huggingface.co/udgamlabs/Paar-en-hi), [en-bn](https://huggingface.co/udgamlabs/Paar-en-bn), [en-mr](https://huggingface.co/udgamlabs/Paar-en-mr), [en-te](https://huggingface.co/udgamlabs/Paar-en-te), [en-ta](https://huggingface.co/udgamlabs/Paar-en-ta), [en-gu](https://huggingface.co/udgamlabs/Paar-en-gu), [en-ur](https://huggingface.co/udgamlabs/Paar-en-ur), [en-kn](https://huggingface.co/udgamlabs/Paar-en-kn), [en-ml](https://huggingface.co/udgamlabs/Paar-en-ml), [en-pa](https://huggingface.co/udgamlabs/Paar-en-pa), [en-or](https://huggingface.co/udgamlabs/Paar-en-or)
- Dataset de referencia: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Paper citado en los tags (arXiv:2305.16307): https://arxiv.org/abs/2305.16307
