# vanshnawander/assignment2-moe-top2

## Resumen

vanshnawander/assignment2-moe-top2 es un transformer decoder-only con arquitectura de mezcla de expertos (MoE) publicado en HuggingFace por el usuario vanshnawander. El modelo cuenta con 35.402.752 parametros totales y hasta 29.123.584 parametros activos por token, seis capas, ocho cabezas de atencion, tamano oculto de 512 y una ventana de contexto de 256 tokens. Esta disenado especificamente para la traduccion de vietnamita y japones a ingles.

Se trata de un modelo de investigacion de tamano reducido, distribuido con codigo de arquitectura propio en PyTorch en lugar de una clase estandar de las librerias habituales, lo que obliga a importar el modulo `load_model.py` aportado por el autor para instanciarlo. Su relevancia es limitada a entornos academicos y de experimentacion: apenas ocupa 0,1 GB y acumula cero descargas y cero "likes" en el momento de redactar esta ficha, por lo que no debe considerarse un modelo listo para produccion.

El modelo reporta una perplejidad de test de 64,9313 y un BLEU de 15,3748, cifras que lo sitúan en un rango propio de un prototipo didactico. No se especifica licencia, idiomas declarados en metadatos ni composicion del corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) |
| Parametros totales | 35.402.752 |
| Parametros activos | Hasta 29.123.584 por token |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Entrada en vietnamita y japones, salida en ingles (no hay lista de idiomas en los metadatos de HuggingFace) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model_state.pt`, solo tensores); arquitectura en codigo fuente propio |
| Capas | 6 |
| Cabezas de atencion | 8 |
| Tamano oculto | 512 |
| Vocabulario | 32.000 tokens, byte-level BPE |
| Tokens especiales | PAD=0, BOS=1, EOS=2, SEP=3, VI=4, JA=5 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con mezcla de expertos. La diferencia entre parametros totales (35.402.752) y parametros activos por token (hasta 29.123.584) confirma un esquema de activacion dispersa: en cada paso se calcula un subconjunto de los parametros, presumiblemente mediante enrutamiento a un numero reducido de expertos. El sufijo "top2" del nombre del repositorio sugiere un enrutamiento top-2, aunque la model card no documenta de forma explicita la configuracion exacta de expertos ni la funcion de enrutamiento utilizada.

El modelo emplea un vocabulario byte-level BPE de 32.000 tokens y se entrena para traduccion, con prompts del tipo `[BOS, language_id, source_tokens..., SEP]`, donde el language_id es VI=4 o JA=5. Los prompts de continuacion usan el formato `[BOS, text_tokens...]`. La model card indica que los ajustes de arquitectura, configuracion de entrenamiento y resultados de evaluacion se incluyen como ficheros JSON en el repositorio. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion; todos estos datos se consideran no disponibles. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El repositorio incluye `decoding.py` con utilidades de decodificacion basadas en forward.

## Capacidades

- Generacion de texto y traduccion automatica de vietnamita a ingles y de japones a ingles.
- Traduccion de frases y parrafos cortos, limitada estrictamente a 256 tokens de entrada.
- Continuacion de texto libre mediante el formato `[BOS, text_tokens...]`.
- Codificacion y decodificacion token a token con tokenizer byte-level BPE propio.
- Inferencia local en CPU o GPU a traves de PyTorch (`torch.inference_mode`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del par VI/JA a ingles.
- No se documentan capacidades de vision, audio, thinking mode ni otras modalidades.

## Casos de uso

- Traduccion de frases y parrafos cortos de vietnamita o japones a ingles: el modelo acepta prompts con identificador de idioma y devuelve la traduccion, adecuado para textos de una o dos frases siempre que no se superen los 256 tokens.
- Preprocesado de corpus para investigacion: puede usarse como traductor auxiliar para preprocesar datos multilingues en pequenos lotes, dado su bajo coste computacional.
- Prototipado academico de arquitecturas MoE: al distribuir la arquitectura como codigo PyTorch legible, sirve para estudiar enrutamiento de expertos y calculo de parametros activos en un modelo de juguete.
- Docencia y demostraciones: su tamano reducido (35,4 M de parametros, 0,1 GB) permite ejecutarlo y modificarlo en un portatil o incluso en CPU, lo que facilita explicar el funcionamiento de un transformer con MoE.
- Traduccion embebida en dispositivos con recursos muy limitados: los pesos ocupan del orden de 142 MB en FP32 y unos 71 MB en FP16, por lo que caben en entornos sin GPU dedicada.
- Traduccion de mensajes cortos de soporte o chat (tickets, mensajes de usuario) entre japones o vietnamita e ingles, siempre que los turnos se mantengan por debajo de 256 tokens.
- Punto de partida para fine-tuning: al publicarse los pesos como tensores y el codigo de carga, puede reentrenarse o ajustarse en tareas de traduccion o clasificacion de texto de pocos tokens.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Perplejidad de test | 64,9313 |
| BLEU | 15,3748 |

No se han publicado tablas comparativas con otros modelos ni resultados adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 142 MB en FP32 y unos 71 MB en FP16 para los 35,4 M de parametros, mas el coste del vocabulario y de las activaciones.
- GPU recomendadas: cualquier GPU, incluida una integrada; no requiere aceleradores de gama alta (A100, H100) para un modelo de este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta moderna (RTX 3090, RTX 4090, e incluso modelos de gama baja) y tambien en CPU.
- Opciones de despliegue: no disponible para vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura es codigo propio y los pesos no estan en GGUF ni en safetensors estandar. El unico metodo documentado es cargar `load_model.py` con PyTorch e importar el tokenizer mediante `tokenizers`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vanshnawander/assignment2-moe-top2 | 35,4 M totales / hasta 29,1 M activos | 256 tokens | no disponible | HuggingFace, codigo propio |
| Helsinki-NLP/opus-mt (familia) | Del orden de decenas de millones (aproximado) | 512 tokens | variable segun modelo | HuggingFace, transformers |
| facebook/nllb-200-distilled-600M | 600 M (aproximado) | 512 tokens (aproximado) | CC-BY-NC-4.0 (aproximado) | HuggingFace, transformers |
| facebook/mbart-large-50 | Del orden de 600 M (aproximado) | 1024 tokens (aproximado) | MIT (aproximado) | HuggingFace, transformers |

Los valores marcados como aproximados deben verificarse en las fichas oficiales de cada modelo. No se dispone de resultados de benchmark comparables publicados en la informacion proporcionada para este modelo, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; con un BLEU de 15,3748 y perplejidad de test de 64,9313, la calidad de traduccion es propia de un prototipo y probablemente contenga errores frecuentes.
- Ventana de contexto muy reducida (256 tokens), lo que impide procesar documentos largos o conversaciones multi-turno extensas.
- Idiomas limitados a vietnamita y japones como entrada y a ingles como salida; no hay soporte documentado de otros pares.
- Licencia no disponible: no se puede asumir permiso para uso comercial, y conviene contactar con el autor antes de cualquier despliegue productivo.
- Sesgos conocidos: no disponibles; no se documenta la composicion del corpus, por lo que se desconocen los sesgos de genero, culturales o geograficos que pueda arrastrar.
- Codigo de arquitectura propio: cargar el modelo implica importar y ejecutar codigo del repositorio. La propia model card recomienda revisar el codigo fuente antes de importarlo, lo que constituye un riesgo de seguridad si no se audita.
- No incluye corpus de entrenamiento ni credenciales, y los estados del optimizador y del generador aleatorio quedan en los checkpoints locales del autor, de modo que la reproducibilidad completa del entrenamiento no es posible con lo publicado.
- Cero descargas y cero "likes" en HuggingFace: no existe validacion de la comunidad ni garantia de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/vanshnawander/assignment2-moe-top2
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la busqueda web.
