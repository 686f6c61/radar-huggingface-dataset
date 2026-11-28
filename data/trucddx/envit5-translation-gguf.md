# trucddx/envit5-translation-gguf

## Resumen

`trucddx/envit5-translation-gguf` es una conversion no oficial del modelo `VietAI/envit5-translation` al formato GGUF con cuantizacion Q8_0, publicada por el usuario trucddx. El modelo original, desarrollado por VietAI, es un T5 encoder-decoder de 351.976.704 parametros especializado en traduccion bidireccional ingles-vietnamita. Esta version GGUF reduce el peso de los pesos de aproximadamente 1,1 GB a unos 375 MB, lo que la hace adecuada para inferencia en dispositivos con recursos limitados, como lectores de libros electronicos o aplicaciones de escritorio.

La relevancia de esta ficha radica en que el modelo esta pensado para traduccion en el dispositivo dentro del lector Ezpub, un caso de uso muy concreto de traduccion local sin conexion. Al estar en formato GGUF, es compatible con runtimes como llama.cpp, lo que permite ejecutarlo en CPU sin necesidad de GPU. No se han realizado reentrenamientos ni ajustes finos: la conversion solo cambia el formato y la precision de los pesos.

El modelo hereda la licencia OpenRAIL del modelo base y mantiene las restricciones de uso de dicha licencia. Es importante senalar que se trata de una conversion no afiliada a VietAI y que la calidad de traduccion puede diferir ligeramente de la del original debido a la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (transformer encoder-decoder) |
| Parametros totales | 351.976.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | en, vi |
| Licencia | openrail |
| Formato de pesos | GGUF (model.gguf); config.json y tokenizer.json en JSON |

## Arquitectura y entrenamiento

El modelo base `VietAI/envit5-translation` es una instancia de la familia T5, con arquitectura transformer encoder-decoder. Esta version GGUF conserva la misma arquitectura y los mismos pesos, unicamente convertidos a GGUF y cuantizados a Q8_0. El autor indica explicitamente que no ha habido reentrenamiento ni ajuste fino: `config.json` y `tokenizer.json` se copian sin cambios del repositorio original.

El modelo original fue entrenado sobre los corpus MTet (multi-domain translation for English and Vietnamese) y PhoMT, segun se cita en la model card. No se dispone en la informacion proporcionada de detalles sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica de esta publicacion es la conversion a GGUF con cuantizacion Q8_0, que reduce el tamano del artefacto de aproximadamente 1,1 GB a unos 375 MB manteniendo una calidad de traduccion cercana a la del original.

## Capacidades

- Traduccion bidireccional ingles-vietnamita: el modelo traduce de ingles a vietnamita y de vietnamita a ingles.
- Uso mediante prefijo de idioma: la entrada debe ir precedida por el codigo del idioma de origen (`en: <texto en ingles>` para traducir a vietnamita; `vi: <texto en vietnamita>` para traducir a ingles).
- Inferencia en dispositivo: el formato GGUF permite ejecucion local en CPU mediante runtimes compatibles.
- Traduccion de texto plano: no se documentan capacidades de vision, audio, tool calling ni agentes.
- No se documentan capacidades de razonamiento multi-paso, generacion de codigo ni matematicas como tales; el modelo esta especializado en traduccion.

## Casos de uso

- Traduccion integrada en lectores de libros electronicos: el modelo se diseno para el lector Ezpub, donde traduce fragmentos de texto en ingles o vietnamita sin conexion a internet, gracias a su tamano reducido en GGUF.
- Traduccion local en aplicaciones de escritorio: al ejecutarse con llama.cpp u otros runtimes GGUF, puede integrarse en herramientas de escritorio para traducir documentos o parrafos sin enviar datos a servicios en la nube.
- Traduccion en dispositivos con recursos limitados: con unos 375 MB en Q8_0, cabe en equipos sin GPU dedicada y permite traduccion en CPU.
- Preprocesamiento de corpus bilingues: util para generar traducciones preliminares de textos ingles-vietnamita en pipelines de datos antes de una revision humana.
- Traduccion de contenido web o articulos: puede emplearse para traducir parrafos o secciones de paginas en ingles a vietnamita y viceversa en herramientas de lectura.
- Prototipado de sistemas de traduccion sin conexion: sirve como base para experimentar con traduccion neuronal local en entornos con conectividad limitada o requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el artefacto Q8_0 ocupa aproximadamente 375 MB, por lo que la huella de memoria es reducida.
- GPU recomendadas: no disponible; al ser un modelo pequeno en GGUF, puede ejecutarse en CPU.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer con al menos unos pocos GB de memoria libre, aunque no se proporcionan cifras oficiales.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF; el autor lo orienta a inferencia en dispositivo (lector Ezpub).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| trucddx/envit5-translation-gguf | 351.976.704 | no disponible | en, vi | openrail | GGUF Q8_0 |
| VietAI/envit5-translation (original) | 351.976.704 | no disponible | en, vi | openrail | PyTorch (pytorch_model.bin) |
| Otros modelos de traduccion en-vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Conversion no oficial: el repositorio no esta afiliado ni respaldado por VietAI; todos los creditos del modelo corresponden a los autores originales.
- Calidad de traduccion potencialmente alterada: la cuantizacion Q8_0 puede introducir diferencias ligeras respecto al modelo original en PyTorch.
- Ambito limitado a ingles y vietnamita: no soporta otros pares de idiomas.
- Requiere prefijo de idioma: es necesario indicar el idioma de origen en la entrada (`en:` o `vi:`), lo que condiciona la integracion.
- Riesgo de alucinacion y errores de traduccion: no se documentan evaluaciones especificas de fidelidad; como todo modelo de traduccion neuronal, puede producir errores en textos especializados o ambiguos.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Restricciones de licencia: la licencia OpenRAIL impone restricciones de uso basadas en el uso; se aplican a este modelo y a cualquier derivado. Al redistribuirlo debe mantenerse la misma licencia y acreditar a los autores originales.
- Terminos de los datos: el modelo original se entreno con MTet y PhoMT; deben revisarse tambien los terminos de dichos datasets.
- Sin datos de contexto ni benchmarks: no se dispone de longitud de contexto documentada ni de resultados de evaluacion publicados en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/trucddx/envit5-translation-gguf
- Modelo base: https://huggingface.co/VietAI/envit5-translation
- Sobre la licencia OpenRAIL: https://huggingface.co/blog/open_rail
- Corpus MTet: https://research.vietai.org/mtet/
- Corpus PhoMT: https://github.com/VinAIResearch/PhoMT
- Paper MTet (arXiv): https://doi.org/10.48550/ARXIV.2210.05610
