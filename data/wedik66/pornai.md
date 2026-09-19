# wedik66/Pornai

## Resumen

wedik66/Pornai es un repositorio de pesos en formato GGUF publicado por el usuario wedik66 en Hugging Face. Segun su propia model card, se trata de una conversion directa (cuantizada) del modelo alibaba-pai/Wan2.2-Fun-5B-Control-Camera, un modelo de generacion de video condicionado por imagen (image-to-video) con control de camara desarrollado por Alibaba PAI. El repositorio no introduce un entrenamiento propio documentado: su aportacion es el empaquetado de los pesos del modelo base en GGUF para su uso en pipelines locales de ComfyUI.

El modelo cuenta con 5.245.802.688 parametros totales (aproximadamente 5,25 mil millones), un tamano que lo situa en la gama media de los modelos de difusion de video y que, gracias a la cuantizacion, permite plantear inferencia en GPUs de consumo. El pipeline declarado es image-to-video y el repositorio ocupa 51,9 GB, un tamano coherente con la presencia de varios niveles de cuantizacion junto con el VAE en safetensors.

Su relevancia actual es limitada y debe interpretarse con cautela: el repositorio acumula 0 descargas y 0 likes, no incluye resultados de benchmarks ni documentacion sobre el proceso de cuantizacion, y el nombre del repositorio no se corresponde con el contenido descrito en la model card (una conversion directa del modelo de Alibaba), lo que genera incertidumbre sobre si existe un ajuste fino adicional no documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no documenta la arquitectura interna; el pipeline se compone de un modelo principal en `ComfyUI/models/unet`, un encoder de texto Umt5-xxl y un VAE, lo que corresponde a un esquema de difusion latente con condicionamiento de texto) |
| Parametros totales | 5.245.802.688 (dato real de safetensors aportado en la informacion) |
| Parametros activos | no disponible (no se documenta que sea MoE; el recuento de parametros y el nombre del modelo base sugieren un modelo denso) |
| Longitud de contexto | no aplica / no disponible (modelo de generacion de video; no se documenta el numero maximo de fotogramas ni la resolucion de salida) |
| Tipos de cuantizacion | GGUF; la model card no enumera los niveles concretos incluidos en el repositorio |
| Idiomas soportados | en, zh (idiomas declarados para el prompt de condicionamiento) |
| Licencia | apache-2.0 (se mantienen los terminos y restricciones de uso del modelo original) |
| Formato de pesos | GGUF (modelo principal) y safetensors (VAE `Wan2.2_VAE.safetensors`); el encoder de texto Umt5-xxl se distribuye por separado en safetensors o GGUF |

Otros datos del repositorio: autor wedik66, fecha de creacion y ultima actualizacion 2026-09-19, tamano del repositorio 51,9 GB, 0 descargas y 0 likes, libreria declarada `gguf`.

## Arquitectura y entrenamiento

La model card describe exclusivamente el procedimiento de conversion: los pesos del modelo alibaba-pai/Wan2.2-Fun-5B-Control-Camera se han transformado a formato GGUF para poder cargarse en ComfyUI mediante el nodo personalizado ComfyUI-GGUF de city96. El pipeline completo requiere tres componentes diferenciados: el modelo principal (el archivo GGUF de este repositorio, ubicado en `ComfyUI/models/unet`), el encoder de texto Umt5-xxl (que puede obtenerse en safetensors desde el repositorio Comfy-Org/Wan_2.2_ComfyUI_Repackaged o en GGUF desde city96/umt5-xxl-encoder-gguf) y el VAE `Wan2.2_VAE.safetensors` incluido en este mismo repositorio.

No se dispone de informacion sobre la arquitectura interna del modelo base (numero de bloques, mecanismo de atencion, uso de atencion lineal o decodificacion especulativa), ni sobre el dataset de entrenamiento, el numero de tokens o fotogramas utilizados, la composicion de los datos, la resolucion de entrenamiento o si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documenta el proceso de cuantizacion: no se indica que herramienta se utilizo, que niveles se generaron ni que metricas de degradacion se midieron. La unica capacidad diferencial heredada del modelo base, segun su nombre, es el control de camara (Control-Camera) sobre la generacion de video a partir de una imagen.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video), segun el pipeline declarado en el repositorio.
- Control de camara: la capacidad se deduce del nombre del modelo base, alibaba-pai/Wan2.2-Fun-5B-Control-Camera, aunque la model card no detalla parametros, tipos de movimiento soportados ni ejemplos.
- Condicionamiento por texto en ingles y chino (idiomas declarados: en, zh). No se declara soporte de castellano ni de otros idiomas.
- Inferencia local en ComfyUI mediante el nodo ComfyUI-GGUF, con carga del modelo principal en `ComfyUI/models/unet`, el encoder de texto en `ComfyUI/models/text_encoders` y el VAE en `ComfyUI/models/vae`.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No se documentan capacidades de vision de proposito general, audio, ni generacion de texto mas alla del encoder de texto necesario para el condicionamiento.

## Casos de uso

- Previsualizacion de planos en preproduccion audiovisual: a partir de un fotograma fijo o un storyboard, el modelo permite generar un plano con movimiento de camara controlado, lo que ayuda a validar encuadres y ritmo antes de rodar. El control de camara del modelo base es el elemento que hace util esta aplicacion.
- Generacion de B-roll y material de recurso para publicidad: partiendo de una fotografia de producto o de una localizacion, se pueden generar clips cortos con movimiento de camara para insertarlos en anuncios, siempre que se revise manualmente la coherencia temporal del resultado.
- Animacion de fotografia fija: conversion de retratos, paisajes o imagenes de catalogo en clips con movimiento de camara, util para presentaciones, escaparates digitales o redes sociales.
- Prototipado en pipelines de VFX y motion graphics: el formato GGUF y la integracion con ComfyUI-GGUF permiten incorporar el modelo a grafos de nodos existentes para generar capas de video temporales que despues se refinan en herramientas de composicion.
- Demos interactivas y contenido para videojuegos: generacion de clips de camara sobre arte conceptual o capturas de un motor para presentar prototipos de escenas o entornos antes de producirlos.
- Experimentacion en investigacion sobre difusion de video: el repositorio sirve como punto de partida para reproducir resultados del modelo base en hardware limitado y evaluar la degradacion introducida por la cuantizacion GGUF, aunque no se publican metricas que permitan hacerlo de forma estandarizada.
- Despliegue local en estaciones de trabajo con GPU de consumo: la cuantizacion reduce el requisito de VRAM respecto al modelo original, lo que permite ejecutar el pipeline sin acceso a GPUs de centro de datos para tareas de prueba y generacion puntual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas cuantitativas (FVD, CLIP score, VBench ni ninguna otra), no compara la calidad de la conversion GGUF con la del modelo original y no documenta latencias ni throughput. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos eran articulos en aleman sobre configuracion de VPN en Windows, completamente ajenos al objeto de esta ficha.

## Requisitos de hardware

Todas las cifras de VRAM de esta seccion son estimaciones calculadas a partir del recuento de parametros (5,25 mil millones) y de la estructura del pipeline descrita en la model card; no proceden de mediciones publicadas por el autor.

- Peso de los parametros del modelo principal: aproximadamente 10,5 GB en FP16, unos 5,6 GB en cuantizacion Q8, unos 3,6 GB en Q5 y unos 3,0 GB en Q4, asumiendo cuantizaciones lineales estandar.
- Componentes adicionales obligatorios: el encoder de texto Umt5-xxl anade del orden de 11 GB en FP16 o entre 5 y 7 GB en cuantizaciones de 8 y 5 bits; el VAE `Wan2.2_VAE.safetensors` anade un consumo menor, pero no despreciable.
- VRAM total estimada: por encima de 24 GB para una configuracion comoda en FP16 con el encoder en precision alta; en torno a 12-16 GB combinando el modelo en Q4/Q5 con el encoder cuantizado, a lo que hay que sumar la memoria de las activaciones, que en modelos de difusion de video crece con el numero de fotogramas y la resolucion.
- GPUs recomendadas: A100 (40 o 80 GB) o H100 para FP16 sin restricciones; RTX 4090, RTX 3090 o RTX A6000 (24 GB) para cuantizaciones intermedias; RTX 4080, 4070 Ti Super o equivalentes de 16 GB para Q4 con el encoder cuantizado.
- Cabe en GPU de consumo: si, en GPUs de 12 GB o mas con cuantizaciones Q4/Q5 y el encoder de texto tambien cuantizado, siempre que se ajusten resolucion y numero de fotogramas.
- Opciones de despliegue: ComfyUI con el nodo personalizado ComfyUI-GGUF es la via documentada por el autor. Para el modelo original en safetensors, el ecosistema habitual es ComfyUI o Diffusers. No hay indicios de soporte en vLLM, TGI o llama.cpp (estas herramientas estan orientadas a modelos de lenguaje y no a difusion de video).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / salida | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wedik66/Pornai | 5.245.802.688 | no disponible (image-to-video con control de camara) | GGUF + safetensors (VAE) | apache-2.0 | Comunidad, 0 descargas y 0 likes |
| alibaba-pai/Wan2.2-Fun-5B-Control-Camera | no disponible en la informacion (el nombre indica 5B) | no disponible | safetensors | no disponible en la informacion | Modelo base oficial de Alibaba PAI |
| Otras conversiones GGUF de Wan2.2 | no disponible | no disponible | GGUF | no disponible | no disponible |

No se dispone de datos sobre modelos alternativos de la misma categoria (por ejemplo, otros generadores de video con control de camara o de tamano similar) en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento. La unica comparacion verificable es la que existe entre este repositorio y su modelo base, del que se diferencia exclusivamente por el formato de pesos.

## Limitaciones y advertencias

- Validacion comunitaria nula: 0 descargas y 0 likes en la fecha de consulta, sin issues, discusiones ni ejemplos de uso que permitan verificar que la conversion GGUF funciona correctamente.
- Discrepancia entre el nombre del repositorio y su contenido: la model card afirma que se trata de una conversion directa del modelo de Alibaba, sin documentar ningun ajuste fino adicional. No hay forma de verificar desde la informacion disponible que el contenido generado se corresponda con el del modelo base ni que se hayan alterado los pesos.
- Riesgo de contenido inapropiado: el nombre del repositorio sugiere contenido para adultos. Esto implica riesgos legales, de cumplimiento y de politica de uso en plataformas, ademas de la necesidad de verificar la mayoria de edad en cualquier despliegue publico y de revisar las condiciones de uso del modelo base.
- Licencia: aunque el repositorio declara apache-2.0, la propia model card advierte de que, al ser un modelo cuantizado, siguen vigentes todos los terminos de licencia y las restricciones de uso del modelo original. Es imprescindible consultar la licencia de alibaba-pai/Wan2.2-Fun-5B-Control-Camera antes de cualquier uso comercial; ese dato no esta disponible en la informacion proporcionada.
- Degradacion por cuantizacion: no se publican metricas que cuantifiquen la perdida de calidad respecto al modelo original, un aspecto critico en difusion de video, donde los artefactos se acumulan a lo largo de los fotogramas.
- Artefactos temporales: como todo modelo de difusion de video, es propenso a parpadeos, morphing, incoherencias de movimiento y deriva de identidad entre fotogramas; no hay documentacion sobre como lo mitiga este pipeline.
- Idiomas: solo se declaran ingles y chino para el prompt. No hay soporte documentado de castellano, lo que obliga a traducir las instrucciones de condicionamiento.
- Ausencia de benchmarks: no hay ningun dato cuantitativo que permita comparar calidad, coherencia temporal o fidelidad al control de camara.
- Falta de documentacion tecnica: se desconocen los niveles de cuantizacion incluidos, la herramienta de conversion, la resolucion de entrenamiento del modelo base y el numero maximo de fotogramas soportado.
- Tamano del repositorio: 51,9 GB, lo que exige planificar el almacenamiento y la descarga, especialmente si se quieren conservar varios niveles de cuantizacion.
- Fecha de publicacion: el repositorio esta fechado en 2026-09-19, sin actualizaciones posteriores ni mantenimiento documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wedik66/Pornai
- Modelo base: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control-Camera
- Nodo personalizado para ComfyUI: https://github.com/city96/ComfyUI-GGUF
- Encoder de texto Umt5-xxl en GGUF: https://huggingface.co/city96/umt5-xxl-encoder-gguf/tree/main
- Encoder de texto en safetensors: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/tree/main/split_files/text_encoders
- Perfil del autor en Hugging Face: https://huggingface.co/city96

No se han encontrado papers, blogs tecnicos, demos ni repositorios adicionales asociados a este modelo en la busqueda web realizada.
