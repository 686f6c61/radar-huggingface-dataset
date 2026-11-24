# teamwon/opus-mt-en-ko-onnx

## Resumen

opus-mt-en-ko-onnx es un modelo de traducción automática inglés-corean basado en la arquitectura MarianMT, desarrollado por el usuario teamwon como exportación ONNX del modelo original Helsinki-NLP/opus-mt-tc-big-en-ko. Su propósito es ofrecer traducción EN→KO ejecutable en el navegador o en entornos JavaScript mediante transformers.js, con un peso reducido de aproximadamente 265 MB tras cuantización dinámica int8, lo que lo hace unas 70 veces más pequeño que la alternativa NLLB-200-distilled-600M (~894 MB) y entre 5 y 10 veces más rápido por frase según la model card.

El modelo resuelve el problema de desplegar traducción neuronal de calidad en clientes ligeros, sin necesidad de infraestructura GPU dedicada, manteniendo la licencia permisiva CC-BY-4.0 del modelo fuente. Es relevante para aplicaciones web, extensiones de navegador y pipelines edge donde el coste de latencia y ancho de banda importa, aunque su especialización es estricta: solo traduce de inglés a coreano y no soporta otras direcciones ni tareas generativas.

La ficha se basa exclusivamente en la información disponible en Hugging Face y la model card; los datos no publicados se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 dinámica (ONNX) |
| Idiomas soportados | inglés (en) y coreano (ko), dirección EN→KO |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder y decoder separados; tokenizer.json y tokenizer_target.json) |

## Arquitectura y entrenamiento

El modelo es una exportación del checkpoint Helsinki-NLP/opus-mt-tc-big-en-ko, que emplea la arquitectura MarianMT, un transformer encoder-decoder diseñado específicamente para traducción automática neuronal. La exportación se realizó con la herramienta `optimum` de Hugging Face, aplicando cuantización dinámica int8 a los pesos ONNX. El resultado se distribuye en dos ficheros: encoder (~105 MB) y decoder (~161 MB), sumando aproximadamente 265 MB.

Una particularidad técnica relevante es que se trata de un modelo *sepvoc* (vocabularios separados para origen y destino). Por ello, la model card advierte que `tokenizer.json` corresponde al tokenizador inglés y `tokenizer_target.json` al coreano; el pipeline `translation` de transformers.js decodifica con el vocabulario fuente y produce resultados incorrectos, por lo que debe usarse `AutoModelForSeq2SeqLM` con `generate()` manual y decodificar con el tokenizador destino. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste por RLHF o DPO en la información proporcionada.

## Capacidades

- Traducción automática de inglés a coreano (EN→KO) de texto plano.
- Ejecución en navegador y entornos JavaScript mediante transformers.js y ONNX Runtime Web.
- Inferencia en CPU sin GPU, gracias a la cuantización int8 y al tamaño reducido.
- Compatible con el ecosistema ONNX, lo que permite su uso en Node.js, Deno y otros runtimes con soporte ONNX.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta visión, audio ni otras modalidades.
- No soporta otras direcciones de traducción (KO→EN u otras lenguas).
- Capacidad multilingüe limitada estrictamente al par en→ko.

## Casos de uso

- Traducción en el navegador: integrar el modelo en una web o extensión para traducir contenido inglés a coreano sin enviar texto a un servidor, preservando la privacidad del usuario y eliminando costes de backend.
- Localización de interfaces de usuario: traducir cadenas de UI, etiquetas y mensajes de error de aplicaciones web de forma dinámica en el cliente, con latencia baja gracias al tamaño reducido del modelo.
- Procesamiento por lotes en Node.js: usar ONNX Runtime en un servicio backend ligero para traducir grandes volúmenes de documentos o correos EN→KO sin GPU, reduciendo el coste operativo frente a modelos de mayor tamaño.
- Extensiones de navegador para lectura: traducir artículos, documentación técnica o foros en inglés a coreano al vuelo, aprovechando la ejecución local y el reducido tamaño del paquete (~265 MB).
- Aplicaciones de mensajería y chat: traducir mensajes entrantes en inglés a coreano en tiempo real en clientes móviles o web, con un modelo que cabe en memoria de dispositivos modestos.
- Prototipado rápido de pipelines de traducción: servir como baseline ligero en entornos de investigación o demos donde no se dispone de GPU y se necesita una traducción EN→KO funcional con licencia permisiva.
- Traducción de documentación técnica en CI/CD: incorporar el modelo en un paso de build que genere versiones coreanas de README o guías, usando ONNX Runtime en el runner sin dependencias pesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que el modelo es entre 5 y 10 veces más rápido por frase que NLLB-200-distilled-600M y aproximadamente un 70 % más pequeño, pero no proporciona métricas de calidad como BLEU, COMET o METEOR.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecución en CPU; en GPU, el modelo int8 ocupa aproximadamente 265 MB de memoria, por lo que cualquier GPU con más de 1 GB podría alojarlo.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU y entornos edge. Cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) puede ejecutarlo con holgura.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con al menos 1 GB de VRAM; también en CPU y en navegador.
- Opciones de despliegue: transformers.js (navegador y Node.js), ONNX Runtime (Web, Node, Python), y cualquier runtime compatible con ONNX. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles de forma numérica; la model card afirma 5–10× más rápido por frase que NLLB-200-distilled-600M, sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| teamwon/opus-mt-en-ko-onnx | no disponible | no disponible | ~265 MB (int8) | CC-BY-4.0 | Hugging Face |
| Helsinki-NLP/opus-mt-tc-big-en-ko | no disponible | no disponible | no disponible (pesos originales) | CC-BY-4.0 | Hugging Face |
| Facebook NLLB-200-distilled-600M | 600 M | no disponible | ~894 MB | CC-BY-NC-4.0 | Hugging Face |

La comparativa se limita a los datos disponibles. El modelo fuente de Helsinki-NLP es la referencia directa, mientras que NLLB-200-distilled-600M se cita en la model card como alternativa multilingüe de mayor tamaño y menor velocidad, con licencia no comercial (CC-BY-NC-4.0), lo que restringe su uso en producción comercial frente a la licencia CC-BY-4.0 de este modelo.

## Limitaciones y advertencias

- Solo traduce de inglés a coreano; no soporta la dirección inversa ni otros pares de idiomas.
- El uso del pipeline `translation` de transformers.js produce resultados incorrectos por el vocabulario separado (sepvoc); es obligatorio usar `AutoModelForSeq2SeqLM` con `generate()` y decodificar con `tokenizer_target.json`.
- No se han publicado métricas de calidad (BLEU, COMET) en la información disponible, por lo que no es posible evaluar su fidelidad frente a alternativas.
- Riesgo de alucinación y de traducciones literales en dominios especializados (técnico, legal, médico), habitual en modelos Marian de tamaño medio.
- Sesgos potenciales heredados del corpus de entrenamiento del modelo fuente, no documentados en la información disponible.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero exige citar al autor y mantener el aviso de licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se especifica la longitud máxima de secuencia soportada, lo que limita la planificación de traducciones de documentos largos.
- El modelo está pensado para texto plano; no se documenta soporte para formato, HTML o markdown preservando estructura.

## Enlaces

- [Hugging Face: teamwon/opus-mt-en-ko-onnx](https://huggingface.co/teamwon/opus-mt-en-ko-onnx)
- [Modelo fuente: Helsinki-NLP/opus-mt-tc-big-en-ko](https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-ko)
- [Documentación de transformers.js](https://huggingface.co/docs/transformers.js)
- [Alternativa citada: Facebook NLLB-200-distilled-600M](https://huggingface.co/facebook/nllb-200-distilled-600M)
