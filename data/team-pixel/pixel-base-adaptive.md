# Team-PIXEL/pixel-base-adaptive

## Resumen

MPIXEL es una familia de modelos de lenguaje "pixel" desarrollada por Team-PIXEL (Ilker Kesen, Jenny Kunz, Kasra Malihi y Desmond Elliott) que opera directamente sobre texto renderizado visualmente, sin tokenizador. El modelo aquí descrito, `pixel-base-adaptive`, es la variante monolingüe en inglés de 111,6 millones de parámetros, preentrenada con el objetivo de eliminar factores de confusión como la fuente de datos y el esquema de renderizado, sirviendo como referencia controlada frente a los modelos multilingües `mpixel-base` (86M) y `mpixel-large` (307M).

La innovación central es el renderizado adaptativo: el texto se convierte en imagen y se procesa con una arquitectura tipo ViT/MAE. Por defecto se renderizan bigramas de grafemas, el texto chino, japonés y coreano se renderiza un carácter por parche, y el árabe y el hebreo palabra por palabra. Esto permite, en teoría, cubrir sistemas de escritura sin depender de un vocabulario subword predefinido.

El modelo es relevante para investigación en procesamiento tokenization-free y multilingüe, no como modelo generativo de propósito general. Se distribuye bajo licencia Apache 2.0 y está preentrenado sobre FineWeb en inglés. El repositorio es de 0,4 GB y el modelo no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo ViT con preentrenamiento MAE (masked autoencoding) sobre parches de imagen; renderizado adaptativo de texto |
| Parámetros totales | 111.655.680 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la salida de ejemplo es de 513 tokens visuales para dos frases) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la línea de los modelos de lenguaje pixel: el texto se renderiza como imagen y se divide en parches que un ViT procesa, con un preentrenamiento de tipo masked autoencoder (MAE). La variante `pixel-base-adaptive` aplica el esquema de renderizado adaptativo descrito en el paper, aunque al ser monolingüe en inglés el comportamiento efectivo se limita al renderizado por defecto de bigramas de grafemas. La dimensión oculta es 768, según la forma de salida del ejemplo (`[2, 513, 768]`).

El preentrenamiento se realizó sobre el dataset HuggingFaceFW/fineweb en inglés. La model card no detalla el número de tokens, la composición exacta del corpus ni si hubo fases de ajuste con RLHF o DPO; estos datos figuran como no disponibles. El propósito declarado de esta variante monolingüe es aislar el efecto del multilingüismo y del renderizado en las comparaciones con los modelos `mpixel-base` y `mpixel-large`.

## Capacidades

- Codificación de texto renderizado como imagen mediante un encoder ViT; produce representaciones (`last_hidden_state`) utilizables en tareas posteriores.
- Preentrenamiento tipo MAE, orientado a representaciones y no a generación autoregresiva de texto.
- Renderizado adaptativo por bigramas de grafemas en inglés.
- Soporte de procesamiento por lotes a través de `MPIXELProcessor`.
- Capacidades multilingües: no en esta variante (solo inglés); la familia MPIXEL cubre dieciséis idiomas y diez sistemas de escritura en los modelos base y large.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión natural, audio: no disponible (el modelo procesa texto renderizado, no imágenes naturales).

## Casos de uso

- Investigación en tokenización libre: usar el modelo como baseline monolingüe para medir el impacto de eliminar el tokenizador subword en tareas de clasificación o similitud semántica.
- Estudios de representaciones visuales del texto: extraer `last_hidden_state` para analizar cómo el encoder codifica bigramas de grafemas en inglés.
- Comparación controlada con modelos multilingües: emplear esta variante como referencia para aislar el efecto del multilingüismo frente a `mpixel-base` y `mpixel-large` en experimentos reproducibles.
- Fine-tuning en tareas de NLP en inglés: adaptar el encoder a clasificación de textos, análisis de sentimiento o detección de tópicos, dado que el modelo base está preentrenado sobre FineWeb.
- Reproducción de experimentos del paper: servir de punto de partida para replicar los resultados de "Scaling Multilingual Pretraining of Pixel Language Models" en el brazo monolingüe.
- Evaluación de robustez ante tipografías y renderizados: al operar sobre imágenes de texto, permite estudiar la sensibilidad del modelo a fuentes, tamaños y ruido visual en pipelines de OCR o documentos escaneados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 111,6M de parámetros (aproximadamente 0,45 GB en fp32, 0,22 GB en fp16); con activaciones y procesamiento por lotes, cabría en GPUs consumer de 8 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en fp16; A100 o H100 no son necesarias para este tamaño, aunque pueden acelerar el procesamiento por lotes.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: `transformers` con el paquete `mpixel` para el registro en las clases Auto; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Team-PIXEL/pixel-base-adaptive | 111,6M | no disponible | en | apache-2.0 | Hugging Face |
| mpixel-base (misma familia) | 86M | no disponible | 16 idiomas, 10 sistemas de escritura | no disponible en la información | Hugging Face |
| mpixel-large (misma familia) | 307M | no disponible | 16 idiomas, 10 sistemas de escritura | no disponible en la información | Hugging Face |
| Modelos BERT-base comparables | ~110M | 512 tokens típicos | multilingüe o inglés | varía | amplia |

La comparación con BERT-base es orientativa por tamaño y arquitectura encoder, no por paradigma de entrada (texto renderizado frente a tokens). Los datos de contexto y rendimiento de los modelos MPIXEL no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no cubre los dieciséis idiomas de la familia MPIXEL.
- Orientado a representaciones (MAE), no a generación de texto; no debe emplearse como modelo conversacional o de completado.
- Requiere el paquete `mpixel` y un pipeline de renderizado de texto a imagen; no funciona con un tokenizador estándar de `transformers`.
- No se documentan sesgos específicos, pero el preentrenamiento sobre FineWeb en inglés puede heredar sesgos del corpus web.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las representaciones pueden ser poco fiables fuera del dominio de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción generativa.
- Sin métricas publicadas de rendimiento ni datos de throughput; la evaluación en producción requeriría benchmarks propios.
- El repositorio no registra descargas ni likes, lo que sugiere ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Team-PIXEL/pixel-base-adaptive
- Paper: https://arxiv.org/abs/2610.29681
- Repositorio del paquete `mpixel`: https://github.com/ilkerkesen/mpixel
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
