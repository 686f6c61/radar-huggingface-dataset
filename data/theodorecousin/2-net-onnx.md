# TheodoreCousin/2-Net-ONNX

## Resumen

2-Net-ONNX es la conversión al formato ONNX del modelo 2-Net, un clasificador de imágenes orientado a imagen médica oftalmológica (fondos de ojo, "fundus"). Lo publica el usuario TheodoreCousin en Hugging Face y está pensado para su despliegue en entornos de inferencia que consumen ONNX Runtime en lugar de frameworks de deep learning nativos. El pipeline declarado en la model card es `image-classification`, con etiquetas que apuntan a oftalmología y clasificación de imágenes de fondo de ojo.

El modelo base es TheodoreCousin/2-Net, del que esta variante es una cuantización/exportación a ONNX. El repositorio ocupa 1,6 GB y el acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La licencia es CC BY-SA 4.0, lo que impone atribución y compartir-al-igual en obras derivadas.

La información pública disponible es muy limitada: no hay datos de arquitectura interna, número de parámetros, longitud de contexto (no aplica a un clasificador de imagen), composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha recoge lo que consta en la model card y en los metadatos del repositorio, y marca explícitamente como "no disponible" todo lo que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base 2-Net; exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagen) |
| Tipos de cuantizacion | exportacion ONNX (cuantizacion concreta no disponible) |
| Idiomas soportados | no disponible (tarea de vision; sin metadatos de idioma) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX |
| Tarea (pipeline) | image-classification |
| Dominio | imagen medica, oftalmologia (fundus) |
| Modelo base | TheodoreCousin/2-Net |
| Tamano del repositorio | 1,6 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-10 |
| Fecha de actualizacion | 2026-11-10 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base 2-Net ni sobre el proceso de entrenamiento (numero de tokens o imagenes, composicion del dataset, tecnicas de aumento de datos, fine-tuning, etc.). La unica informacion tecnica disponible es que esta variante es una exportacion a ONNX del modelo TheodoreCousin/2-Net, etiquetada como cuantizada respecto al base, lo que sugiere una reduccion de precision para facilitar el despliegue en CPU o en hardware con recursos limitados.

El dominio declarado es la imagen medica oftalmologica (fundus), y la tarea es clasificacion de imagenes. No consta si el modelo realiza clasificacion binaria (por ejemplo, presencia/ausencia de patologia) o multiclase (estadios de retinopatia diabetica, glaucoma, etc.), ni que clases concretas predice. Tampoco hay informacion sobre el dataset de entrenamiento, el esquema de validacion ni las metricas obtenidas.

## Capacidades

- Clasificacion de imagenes de fondo de ojo (fundus) en el dominio oftalmologico, segun las etiquetas del repositorio.
- Inferencia mediante ONNX Runtime, lo que permite despliegue en entornos sin PyTorch o TensorFlow.
- Exportacion cuantizada respecto al modelo base, orientada a reducir requisitos de computo.
- No consta soporte de tool calling, function calling ni capacidades de agente.
- No consta capacidad de generacion de texto, razonamiento, codigo ni matematicas (es un clasificador de imagen).
- No consta soporte multilingue ni capacidades multimodales mas alla de la entrada de imagen.
- No consta modo "thinking", vision general, audio ni ninguna capacidad especial adicional.

## Casos de uso

- Triaje automatizado de retinopatias en campanas de cribado: el modelo puede clasificar imagenes de fondo de ojo capturadas en centros de atencion primaria y derivar los casos sospechosos a un oftalmologo, reduciendo la carga de revision manual. Es adecuado por su dominio especifico y por el formato ONNX, que facilita el despliegue en equipos modestos.
- Preprocesado en pipelines de telemedicina: integrado como primer filtro en una plataforma de telediagnostico, permite descartar imagenes normales antes de la revision por especialistas, siempre que se valide su sensibilidad en el contexto de uso.
- Despliegue en dispositivos con recursos limitados: al estar exportado a ONNX y cuantizado, puede ejecutarse en CPU o en GPUs de gama baja dentro de clinicas sin infraestructura de servidores dedicada.
- Investigacion en imagen medica: util como baseline reproducible en estudios comparativos de clasificadores de fondo de ojo, dado que el formato ONNX simplifica la integracion en entornos de evaluacion heterogeneos.
- Integracion en sistemas de historia clinica electronica: mediante ONNX Runtime, el modelo puede incrustarse en aplicaciones sanitarias existentes para generar una etiqueta de clasificacion preliminar sobre las imagenes adjuntas al expediente.
- Docencia y formacion medica: uso como herramienta de apoyo para ilustrar patrones de clasificacion en imagenes de fondo de ojo, con la advertencia de que no sustituye el juicio clinico.
- Prototipado rapido de aplicaciones de cribado: el formato ONNX y el tamano manejable del repositorio (1,6 GB) permiten montar demos funcionales en pocas horas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No constan metricas de exactitud, sensibilidad, especificidad, AUC ni comparaciones con otros modelos en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo ONNX cuantizado de 1,6 GB de repositorio, es plausible que quepa en GPUs consumer con 4-8 GB de VRAM, pero no hay datos oficiales que lo confirmen.
- GPU recomendadas: no disponible. Por el formato ONNX, puede ejecutarse en CPU y en GPUs NVIDIA, AMD o Intel compatibles con ONNX Runtime.
- GPU consumer: probablemente compatible con tarjetas de gama media (por ejemplo, RTX 3060 o superiores) dada la naturaleza del formato, aunque no se ha verificado.
- Opciones de despliegue: ONNX Runtime (principal), potencialmente integrable en servidores de inferencia compatibles con ONNX. No consta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de clasificacion de fondo de ojo en formato ONNX con los que establecer una comparacion rigurosa de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se conocen arquitectura, parametros, dataset de entrenamiento ni metricas, lo que impide evaluar su fiabilidad.
- Riesgo de sesgo desconocido: al no publicarse la composicion del dataset, no puede descartarse un sesgo demografico (edad, etnia, tipo de camara de fondo de ojo) que afecte a la equidad del modelo.
- Riesgo de alucinacion en sentido amplio: como clasificador, puede producir etiquetas erroneas con alta confianza en imagenes fuera de distribucion o de baja calidad.
- Dominio muy restringido: solo clasificacion de imagenes de fondo de ojo; no debe usarse fuera de ese ambito.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integracion en productos propietarios.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion al despliegue automatizado.
- Sin validacion clinica publicada: no debe emplearse como herramienta diagnostica sin una evaluacion prospectiva independiente y el correspondiente marcado regulatorio.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de retroalimentacion externa sobre su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheodoreCousin/2-Net-ONNX
- Modelo base: https://huggingface.co/TheodoreCousin/2-Net
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
