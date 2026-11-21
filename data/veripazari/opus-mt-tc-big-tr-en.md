# veripazari/opus-mt-tc-big-tr-en

## Resumen

opus-mt-tc-big-tr-en es un modelo de traducción automática neuronal especializado en el par turco-inglés (tur-eng), desarrollado originalmente por Helsinki-NLP dentro del proyecto OPUS-MT. El repositorio analizado aquí es un espejo archivado por VeriPazarı que preserva la documentación original. El modelo emplea la arquitectura transformer-big de Marian NMT, una implementación eficiente escrita en C++ que posteriormente se convirtió a PyTorch mediante la librería transformers de Hugging Face.

Con 234.843.876 parámetros y un tamaño de repositorio de 1,9 GB, se trata de una variante "big" del pipeline estándar de OPUS-MT, entrenada sobre el corpus opusTCv20210807+bt y tokenización SentencePiece con vocabulario de 32.000 tokens. Su relevancia radica en que ofrece traducción turco-inglés de alta calidad en un paquete ligero y desplegable en hardware modesto, con licencia CC-BY-4.0 que permite uso comercial.

El modelo forma parte del ecosistema Tatoeba-Challenge y está pensado para integración en pipelines de traducción, servicios web y aplicaciones de procesamiento de lenguaje natural que requieran conversión turco-inglés con latencia baja y sin dependencia de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer-big (Marian NMT) |
| Parametros totales | 234.843.876 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y pytorch; conversión a GGUF no documentada en la información) |
| Idiomas soportados | turco (tr) como origen, inglés (en) como destino |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer-big de Marian NMT, un encoder-decoder estándar optimizado para traducción automática. Marian es una implementación en C++ puro diseñada para eficiencia en entrenamiento e inferencia, y los pesos se han convertido a PyTorch para su uso con la librería transformers. La tokenización emplea SentencePiece con vocabulario de 32.000 tokens tanto para origen como para destino (spm32k, spm32k).

El entrenamiento se realizó sobre el corpus opusTCv20210807+bt, una recopilación de datos paralelos del proyecto OPUS con técnicas de back-translation (bt). La fecha de publicación del modelo original es 2022-03-17. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo no incorpora innovaciones como decodificación especulativa o atención lineal; es un transformer estándar orientado a traducción.

## Capacidades

- Traducción automática turco-inglés de texto plano.
- Generación de traducciones a nivel de frase y párrafo.
- Soporte de tokenización SentencePiece con vocabulario de 32.000 tokens.
- Compatible con la pipeline `translation` de Hugging Face transformers.
- Inferencia por lotes (batch) mediante `MarianMTModel.generate`.
- No soporta tool calling, function calling ni agentes multi-step.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada exclusivamente al par turco-inglés.

## Casos de uso

- Traducción de documentación técnica: el modelo puede convertir manuales y guías en turco a inglés para equipos internacionales, con la ventaja de un tamaño reducido que permite despliegue en servidores modestos.
- Localización de contenido web: integración en CMS o pipelines de publicación para traducir artículos y páginas turcas al inglés de forma automatizada, aprovechando la licencia CC-BY-4.0 para uso comercial.
- Atención al cliente multilingüe: traducción en tiempo real de mensajes de usuarios turcos a inglés para agentes que no dominan el turco, con latencia baja gracias a los 234M de parámetros.
- Procesamiento de corpus para investigación: traducción de datasets turcos a inglés para análisis lingüístico, estudios comparativos o creación de recursos paralelos, usando la pipeline de transformers.
- Subtitulado y transcripción: traducción de subtítulos turcos a inglés en flujos de postproducción, con procesamiento por lotes para grandes volúmenes de texto.
- Integración en aplicaciones de viaje: traducción instantánea de reseñas, menús o comunicaciones turcas a inglés en apps móviles, donde el tamaño del modelo permite despliegue en edge o servidores ligeros.
- Enriquecimiento de datos para entrenamiento: generación de pares turco-inglés sintéticos para aumentar datasets de otros modelos, aunque con las cautelas propias de la traducción automática.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) en la model card:

| Dataset | Métrica | Valor |
|---|---|---|
| flores101-devtest | BLEU | 37,6 |
| newsdev2016 | BLEU | 32,1 |
| tatoeba-test-v2021-08-07 | BLEU | 57,6 |
| newstest2016 | BLEU | 29,3 |
| newstest2017 | BLEU | 29,7 |
| newstest2018 | BLEU | 30,7 |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP32 (234M parámetros × 4 bytes), alrededor de 500 MB en FP16. El tamaño del repositorio es de 1,9 GB, lo que incluye pesos en múltiples formatos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (PyTorch), pipeline `translation` de Hugging Face, Marian NMT nativo (C++), conversión a ONNX no documentada en la información. No se menciona soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| opus-mt-tc-big-tr-en (este) | 234,8M | no disponible | CC-BY-4.0 | Hugging Face |
| Helsinki-NLP/opus-mt-tr-en | no disponible en la información | no disponible | CC-BY-4.0 | Hugging Face |
| Helsinki-NLP/opus-mt-tc-big-en-tr | no disponible en la información | no disponible | CC-BY-4.0 | Hugging Face |

No se dispone en la información proporcionada de datos de rendimiento comparativos entre estos modelos. La variante estándar `opus-mt-tr-en` suele ser más pequeña que la variante "big" aquí descrita, pero no se confirman parámetros ni BLEU en la documentación consultada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; como todo modelo de traducción entrenado con corpus web, puede reflejar sesgos presentes en los datos de OPUS.
- Riesgo de alucinación: inherente a los modelos de traducción neuronal; puede generar traducciones plausibles pero incorrectas en frases ambiguas o dominios especializados.
- Limitaciones de contexto: la longitud máxima de contexto no está documentada en la información disponible; Marian suele manejar secuencias de hasta 512 tokens, pero este dato no se confirma.
- Limitaciones de idioma: solo traduce de turco a inglés; no soporta otros pares ni direccionalidad inversa.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; es necesario citar el modelo y a Helsinki-NLP según los términos de la licencia.
- Caveat de producción: el repositorio es un espejo archivado por VeriPazarı; para producción se recomienda usar el repositorio original de Helsinki-NLP y verificar la integridad de los pesos.
- Los benchmarks declarados no están verificados (`verified: false`); deben tomarse como orientativos.

## Enlaces

- [Hugging Face (espejo VeriPazarı)](https://huggingface.co/veripazari/opus-mt-tc-big-tr-en)
- [Modelo original Helsinki-NLP](https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-tr-en)
- [Proyecto OPUS-MT](https://github.com/Helsinki-NLP/Opus-MT)
- [Marian NMT](https://marian-nmt.github.io/)
- [OPUS](https://opus.nlpl.eu/)
- [OPUS-MT-train](https://github.com/Helsinki-NLP/Opus-MT-train)
- [Paper OPUS-MT (EAMT 2020)](https://aclanthology.org/2020.eamt-1.61/)
- [Paper Tatoeba Translation Challenge (WMT 2020)](https://aclanthology.org/2020.wmt-1.139/)
- [Tatoeba-Challenge](https://github.com/Helsinki-NLP/Tatoeba-Challenge)
- [README tur-eng en Tatoeba-Challenge](https://github.com/Helsinki-NLP/Tatoeba-Challenge/tree/master/models/tur-eng/README.md)
- [Modelo original (zip)](https://object.pouta.csc.fi/Tatoeba-MT-models/tur-eng/opusTCv20210807+bt_transformer-big_2022-03-17.zip)
- [Traducciones de test](https://object.pouta.csc.fi/Tatoeba-MT-models/tur-eng/opusTCv20210807+bt_transformer-big_2022-03-17.test.txt)
- [Puntuaciones de test](https://object.pouta.csc.fi/Tatoeba-MT-models/tur-eng/opusTCv20210807+bt_transformer-big_2022-03-17.eval.txt)
- [VeriPazarı](https://veripazari.com.tr)
