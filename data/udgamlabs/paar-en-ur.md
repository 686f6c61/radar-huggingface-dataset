# udgamlabs/Paar-en-ur

## Resumen

Paar English → Urdu es un modelo de traducción automática neuronal especializado en la dirección inglés → urdu, desarrollado por Udgam Labs. Se trata de un transformer encoder-decoder de arquitectura Marian, con 17.170.688 parámetros totales, pensado para inferencia en CPU y en navegador. Su propuesta de valor es la eficiencia extrema: el build int8 ocupa 17,7 MB (19,4 MB con vocabulario) y traduce una frase en aproximadamente 36 ms en un solo núcleo de un Mac mini, lo que lo hace apto para despliegues offline, edge computing y aplicaciones web sin backend.

El modelo se obtuvo por destilación a partir de IndicTrans2: aprendió a partir de frases en inglés que el modelo IndicTrans2 dist-200M había traducido al urdu. Forma parte de una familia de doce modelos inglés → lengua india (hindi, bengalí, maratí, telugu, tamil, guyaratí, urdu, canarés, malabar, panyabí, odia y asamés), todos con la misma filosofía de tamaño reducido y licencia Apache 2.0.

Es relevante ahora porque demuestra que un modelo de traducción de calidad aceptable para textos cotidianos puede ejecutarse íntegramente en el navegador con transformers.js o en un servidor modesto con CTranslate2, sin GPU ni conexión a internet. Frente a alternativas mayores, queda ligeramente por detrás en métricas automáticas (entre 0,91 y 3,56 chrF++ según el conjunto de evaluación), pero con un coste computacional y de almacenamiento entre uno y dos órdenes de magnitud menor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | 17.170.688 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada truncada a 127 piezas SentencePiece; salida limitada a 200 tokens en los ejemplos) |
| Tipos de cuantizacion | fp32 (pesos originales), int8 (CTranslate2 y ONNX) |
| Idiomas soportados | inglés (en) → urdu (ur) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), CTranslate2 int8 (`ct2-int8/`), ONNX int8 (`onnx/`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, un transformer encoder-decoder clásico orientado a traducción automática, implementado en la librería transformers como `MarianMTModel` con tokenizador SentencePiece. Con 17,17 millones de parámetros, se sitúa en la gama ultraligera de los modelos de traducción, muy por debajo de los cientos de millones de parámetros habituales en sistemas de traducción multilingüe.

El entrenamiento se realizó por destilación desde IndicTrans2 dist-200M: el modelo alumno aprendió a partir de pares formados por frases en inglés y sus traducciones al urdu generadas por el modelo profesor. El corpus de referencia declarado es ai4bharat/IndicCorpV2. La model card no detalla el número exacto de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de ajuste fino adicionales con datos supervisados humanos o preferencias (RLHF/DPO). Tampoco se documentan innovaciones arquitectónicas más allá de la propia elección de Marian y de la destilación como estrategia de compresión.

La decodificación evaluada es greedy (`num_beams=1`); el autor indica explícitamente que la búsqueda por haz (beam search) no se probó. Las entradas se truncan a 127 piezas y se recomienda procesar una frase por llamada, dividiendo previamente los párrafos.

## Capacidades

- Traducción de texto de inglés a urdu en escritura urdu, con salida en una sola frase por entrada.
- Ejecución offline completa, sin dependencias de red una vez descargados los pesos.
- Inferencia en CPU de un solo núcleo con latencia de aproximadamente 36 ms por frase.
- Ejecución en navegador web mediante transformers.js con el build ONNX int8 (28,6 MB de descarga única).
- Despliegue con CTranslate2 int8 para servidores CPU de bajo coste.
- Compatibilidad con `MarianMTModel` y `MarianTokenizer` de la librería transformers.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada estrictamente al par inglés → urdu; no se declara traducción inversa ni a otras lenguas.

## Casos de uso

- Traducción de interfaces y contenido web en el navegador: con transformers.js y el build ONNX int8, una aplicación puede traducir dinámicamente textos de inglés a urdu sin enviar datos a un servidor, lo que resulta adecuado para contenido sensible o para usuarios con conectividad limitada.
- Atención al cliente en centros de contacto: el modelo puede traducir mensajes entrantes en inglés a urdu para agentes que trabajan en urdu, con latencia de decenas de milisegundos por frase en CPU, suficiente para conversaciones en tiempo real.
- Procesamiento por lotes de documentación: traducción de manuales, correos o tickets en inglés a urdu mediante CTranslate2 int8 en servidores CPU, donde el bajo consumo de memoria (menos de 20 MB de pesos) permite ejecutar muchas instancias en paralelo.
- Aplicaciones de escritorio o móviles offline: integración en herramientas que deben funcionar sin conexión, como visores de documentos o asistentes locales, gracias a que el modelo completo cabe en menos de 20 MB.
- Traducción de contenido generado por usuarios en foros y redes: el modelo traduce frases cortas de inglés a urdu con un coste computacional mínimo, adecuado para moderación o accesibilidad multilingüe a gran escala.
- Prototipado e investigación en destilación de modelos de traducción: al ser un ejemplo documentado de destilación desde IndicTrans2 con receta de ajuste fino publicada en GitHub, sirve como base para reproducir o adaptar la técnica a otros pares de idiomas.
- Educación y aprendizaje de idiomas: generación de traducciones de referencia rápidas en dispositivos de bajo recursos para ejercicios o materiales didácticos.

## Benchmarks y rendimiento

Los resultados publicados en la model card emplean chrF++ (mayor es mejor), con normalización NFC en ambos lados, el mismo conjunto de frases para todos los sistemas y decodificación greedy para Paar y para el modelo offline de Firefox, y beam 5 para indicMT según su propia model card. Las diferencias son pareadas con 1.000 remuestreos bootstrap e intervalo de confianza al 95 %. Mediciones realizadas entre el 3 y el 16 de noviembre de 2026.

| Conjunto de prueba (frases) | Paar (17,3M) | indicMT (153,8M) | IndicTrans2 dist-200M (211,8M) | Modelo offline de Firefox (31,6 MB) |
|---|---:|---:|---:|---:|
| FLORES+ devtest (1.012) | 48,24 | 49,15 (-0,91 [-1,34, -0,49]) | 50,91 | 50,68 (-2,44 [-2,81, -2,04]) |
| IN22-Conv (1.503) | 56,06 | 57,91 (-1,84 [-2,48, -1,18]) | 60,51 | 59,62 (-3,56 [-4,19, -2,92]) |

Datos adicionales aportados por el autor: en IN22-Gen el modelo obtiene 61,25; el build CTranslate2 int8 queda a 0,01 chrF++ de los pesos fp32 en FLORES+ y el 80 % de sus traducciones son idénticas palabra por palabra; el build ONNX int8 queda a 0,09 chrF++ de fp32 en ambos conjuntos. En el navegador, los archivos int8 suman 28,6 MB de descarga única.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, los pesos fp32 ocupan aproximadamente 69 MB y el build int8 alrededor de 18 MB, por lo que cualquier GPU con más de 1 GB de memoria es suficiente.
- GPU recomendadas: no se requieren; el modelo está diseñado para CPU. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) puede ejecutarlo con holgura, pero no aporta ventajas frente a CPU para este tamaño.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU; el autor reporta unos 36 ms por frase en un núcleo de un Mac mini.
- Opciones de despliegue: transformers con `MarianMTModel`, CTranslate2 int8 (`ct2-int8/`), ONNX Runtime y transformers.js (`onnx/`). No se documenta soporte específico para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: aproximadamente 36 ms por frase en CPU de un solo núcleo según el autor; no se publican cifras de throughput por lote ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | chrF++ FLORES+ | chrF++ IN22-Conv | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Paar English → Urdu | 17,3M | no disponible | 48,24 | 56,06 | Apache 2.0 | Hugging Face, CTranslate2, ONNX, transformers.js |
| indicMT | 153,8M | no disponible | 49,15 | 57,91 | no disponible en la información | Hugging Face (int8, beam 5) |
| IndicTrans2 dist-200M | 211,8M | no disponible | 50,91 | 60,51 | no disponible en la información | Hugging Face |
| Modelo offline de Firefox | 31,6 MB (tamaño de archivo) | no disponible | 50,68 | 59,62 | no disponible en la información | Integrado en Firefox |

Paar es el más pequeño de los cuatro y queda por detrás en calidad automática, pero su diferencia con indicMT es de menos de 1 punto chrF++ en FLORES+ y menos de 2 en IN22-Conv, pese a ser unas 8,7 veces menor en tamaño de descarga según el autor.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo; al derivarse de IndicTrans2 y de IndicCorpV2, puede heredar sesgos presentes en esos datos.
- Riesgo de alucinación: como todo modelo de traducción neuronal, puede producir traducciones fluidas pero incorrectas, especialmente en frases ambiguas, terminología técnica o nombres propios; el autor advierte que los ejemplos de la model card son salidas sin editar y no revisadas por nativos.
- Limitaciones de contexto e idioma: entradas truncadas a 127 piezas SentencePiece y salida limitada a 200 tokens en los ejemplos; se recomienda una frase por llamada y dividir párrafos previamente. Solo cubre inglés → urdu, sin traducción inversa ni a otras lenguas.
- Decodificación: los resultados publicados corresponden a greedy; no se evaluó beam search, por lo que no hay garantías de mejora con otras estrategias.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución y las licencias de los datos de entrenamiento subyacentes (IndicCorpV2) antes de un despliegue en producción.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria; no hay revisión por hablantes nativos ni datos sobre robustez ante dominios especializados (legal, médico, técnico).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/Paar-en-ur
- Demo en el navegador (Space): https://huggingface.co/spaces/udgamlabs/Paar
- Código y receta de ajuste fino en GitHub: https://github.com/udgamlabs/paar
- Modelo hermano inglés → hindi: https://huggingface.co/udgamlabs/Paar-en-hi
- Modelo hermano inglés → bengalí: https://huggingface.co/udgamlabs/Paar-en-bn
- Modelo hermano inglés → maratí: https://huggingface.co/udgamlabs/Paar-en-mr
- Modelo hermano inglés → telugu: https://huggingface.co/udgamlabs/Paar-en-te
- Modelo hermano inglés → tamil: https://huggingface.co/udgamlabs/Paar-en-ta
- Modelo hermano inglés → guyaratí: https://huggingface.co/udgamlabs/Paar-en-gu
- Modelo hermano inglés → canarés: https://huggingface.co/udgamlabs/Paar-en-kn
- Modelo hermano inglés → malabar: https://huggingface.co/udgamlabs/Paar-en-ml
- Modelo hermano inglés → panyabí: https://huggingface.co/udgamlabs/Paar-en-pa
- Modelo hermano inglés → odia: https://huggingface.co/udgamlabs/Paar-en-or
- Modelo hermano inglés → asamés: https://huggingface.co/udgamlabs/Paar-en-as
- Dataset de referencia: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Paper citado en los tags (arXiv:2305.16307): https://arxiv.org/abs/2305.16307
