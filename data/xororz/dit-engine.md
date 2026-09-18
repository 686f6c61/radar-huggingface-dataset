# xororz/dit-engine

## Resumen

xororz/dit-engine es un motor de inferencia (runtime) para generacion de imagenes, no un modelo de pesos. Forma parte de la aplicacion Local Dream y se encarga de ejecutar modelos de difusion con arquitectura DiT (Diffusion Transformer), concretamente Z-Image Turbo y FLUX.2/Klein 4B, sobre las NPU Hexagon de Qualcomm. El motor se descarga bajo demanda desde la app; no esta incluido en el APK.

El paquete se compila a partir de stable-diffusion.cpp y del backend Hexagon de ggml, y se distribuye como una biblioteca nativa (`libdit_engine.so`) acompanada de los skels HTP v73, v75, v79 y v81 junto con un fichero `SHA256SUMS`. Su nombre de fichero (`dit_engine_v1_arm64-v8a.zip`) incluye la version de ABI del motor, que la aplicacion comprueba antes de cargar la biblioteca.

Es relevante porque permite generar imagenes de forma totalmente local en moviles Android con Snapdragon 8 Gen 2 o superior, sin depender de la nube ni de GPUs dedicadas. El repositorio de HuggingFace no contiene pesos: el motor los carga desde el paquete de modelo que descarga la aplicacion. Se publica con licencia Apache 2.0 y, en el momento de la consulta, acumula 0 descargas y 0 likes, con un tamano de repositorio de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: es un motor de inferencia para modelos DiT (Diffusion Transformer); no define una arquitectura propia |
| Parametros totales | no aplica: el motor no contiene parametros; los pesos los aporta el paquete de modelo externo |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica: generacion de imagenes, no modelo de lenguaje |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (generacion de imagenes); el idioma del prompt depende del modelo cargado, no disponible |
| Licencia | Apache 2.0 (solo del motor; las licencias de los pesos son independientes) |
| Formato de pesos | no aplica: el motor no distribuye pesos; se entrega como `libdit_engine.so` dentro de `dit_engine_v1_arm64-v8a.zip` |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. dit-engine es una biblioteca de inferencia derivada de stable-diffusion.cpp y del backend Hexagon de ggml, orientada a ejecutar modelos de difusion de tipo DiT sobre la NPU Hexagon (HTP v73, v75, v79 y v81) de los SoC Snapdragon 8 Gen 2 y posteriores, en arquitectura arm64-v8a. El paquete incluye los skels HTP necesarios para esas versiones de hardware, mas un fichero `SHA256SUMS` para verificar la integridad del binario.

El motor implementa un esquema de versionado de ABI: el nombre `dit_engine_v1_arm64-v8a.zip` incluye `v1`, y la aplicacion valida esa version antes de cargar la biblioteca. Una version nueva de ABI se publica como fichero nuevo en lugar de reemplazar el anterior, de forma que las builds antiguas de la aplicacion siguen funcionando. No se detalla en la informacion disponible que variantes concretas de los modelos Z-Image Turbo y FLUX.2/Klein 4B se soportan, ni formatos de cuantizacion, ni el numero de pasos o schedulers disponibles.

## Capacidades

- Ejecucion de inferencia de modelos de difusion DiT en la NPU Hexagon de Qualcomm, en concreto Z-Image Turbo y FLUX.2/Klein 4B segun la model card.
- Carga de pesos desde un paquete de modelo externo, descargado bajo demanda por la aplicacion Local Dream y no incluido en este repositorio ni en el APK.
- Distribucion como biblioteca nativa arm64-v8a con skels HTP para v73, v75, v79 y v81.
- Verificacion de integridad mediante `SHA256SUMS`.
- Control de compatibilidad de ABI: la app comprueba la version del motor antes de cargarlo.
- Generacion de imagenes en dispositivo (on-device), sin enviar prompts ni imagenes a servidores externos.
- Soporte de tool calling / function calling: no disponible (no aplica a un motor de generacion de imagenes).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible (no aplica directamente; depende del codificador de texto del modelo cargado).
- Modo thinking, vision o audio: no disponible (no aplica).

## Casos de uso

- Generacion de imagenes local en Android: la aplicacion Local Dream usa el motor para ejecutar Z-Image Turbo y FLUX.2/Klein 4B en la NPU Hexagon, lo que permite crear imagenes en el dispositivo sin conexion a internet ni coste por inferencia en la nube.
- Escenarios con requisitos de privacidad: al no enviar el prompt ni las imagenes a un servidor, encaja en aplicaciones medicas, legales o corporativas donde los datos no pueden salir del dispositivo.
- Reduccion del tamano del APK: el motor se descarga bajo demanda y no forma parte del APK, lo que facilita cumplir los limites de tamano de las tiendas de aplicaciones manteniendo el soporte de modelos de difusion.
- Integracion en aplicaciones de terceros para Android: cualquier app que quiera ofrecer generacion de imagenes en dispositivos Snapdragon 8 Gen 2 o superior puede enlazar contra la biblioteca y validar su version de ABI antes de cargarla.
- Despliegue en entornos sin conectividad: dispositivos moviles o industriales con Snapdragon usados en campo, kioscos o flotas gestionadas pueden ejecutar el modelo una vez descargado el paquete correspondiente.
- Referencia de portabilidad para desarrolladores: sirve como ejemplo funcional de compilacion de stable-diffusion.cpp con el backend Hexagon de ggml y de empaquetado de skels HTP para distintas versiones de hardware.
- Gestion de compatibilidad en produccion: el esquema de versionado de ABI permite mantener builds antiguas de una app funcionando mientras se despliegan motores nuevos, util en pipelines de actualizacion escalonada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye mediciones de latencia, throughput, calidad de imagen, consumo energetico ni comparaciones con otras implementaciones. Tampoco se han encontrado resultados de benchmarks en la busqueda web realizada (los resultados devueltos eran irrelevantes y no guardaban relacion con el modelo).

## Requisitos de hardware

- Plataforma: Android sobre arm64-v8a, con SoC Qualcomm Snapdragon 8 Gen 2 o superior.
- NPU: Hexagon con HTP v73, v75, v79 o v81. El paquete incluye los skels correspondientes a esas cuatro versiones.
- VRAM: no aplica. La inferencia se ejecuta en la NPU Hexagon del SoC y utiliza memoria compartida del sistema; el consumo real depende del modelo cargado (no disponible).
- GPU dedicadas (A100, H100, RTX 4090 y similares): no soportadas por este paquete, que esta compilado unicamente para arm64-v8a con backend Hexagon.
- Dispositivos Snapdragon anteriores: segun la model card, ejecutan los modelos SD1.5 y SDXL de Local Dream a traves de QNN y no necesitan este paquete.
- Opciones de despliegue: aplicacion Local Dream en Android, mediante la biblioteca `libdit_engine.so`; el motor se construye a partir de stable-diffusion.cpp con el backend Hexagon de ggml. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de motor).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos tecnicos de alternativas comparables en la informacion proporcionada. La propia model card menciona dos referencias que pueden servir de contexto, pero sin cifras que permitan compararlas:

| Alternativa | Ambito | Hardware | Licencia | Datos comparables |
|---|---|---|---|---|
| xororz/dit-engine | Ejecucion de DiT (Z-Image Turbo, FLUX.2/Klein 4B) | Snapdragon 8 Gen 2 o superior, HTP v73/v75/v79/v81 | Apache 2.0 | no disponible (sin benchmarks) |
| Ruta QNN de Local Dream para SD1.5 y SDXL | Ejecucion de SD1.5 y SDXL | Snapdragon anteriores (segun la model card) | no disponible | no disponible |
| stable-diffusion.cpp (proyecto base) | Ejecucion de modelos de difusion | Multiples backends, incluido ggml Hexagon | no disponible en la informacion proporcionada | no disponible |

## Limitaciones y advertencias

- No es un modelo: no contiene pesos ni parametros. Sin descargar el paquete de modelo correspondiente, el motor no puede generar nada.
- El repositorio figura con un tamano de 0.0 GB y 0 descargas: no se ha verificado en la informacion disponible que el fichero `dit_engine_v1_arm64-v8a.zip` este alojado en este repositorio de HuggingFace.
- No hay benchmarks, metricas de latencia ni evaluaciones de calidad publicadas, por lo que no es posible estimar su rendimiento en produccion a partir de los datos disponibles.
- Compatibilidad muy restringida: solo arm64-v8a y NPU Hexagon HTP v73, v75, v79 o v81. Quedan fuera otros SoC, GPU de escritorio e iOS.
- La licencia Apache 2.0 cubre el motor, pero no los pesos de Z-Image Turbo ni de FLUX.2/Klein 4B, cuyas condiciones de uso comercial no se detallan en la informacion proporcionada. Es un riesgo legal a verificar antes de un despliegue comercial.
- La gestion de versiones de ABI obliga a comprobar la version antes de cargar la biblioteca; una discrepancia entre la version esperada por la app y la del fichero descargado puede impedir la carga.
- Riesgo de sesgos y de alucinacion: no disponible a nivel de motor; depende de los modelos de difusion y de los codificadores de texto que se carguen.
- Limitaciones de contexto e idioma: no aplica al motor; dependen del modelo de difusion y de su text encoder, no documentados aqui.
- La busqueda web realizada no devolvio informacion util sobre el modelo (los resultados eran de un proveedor de television israeli, sin relacion con el proyecto).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xororz/dit-engine
- Proyecto Local Dream (aplicacion que usa el motor): https://github.com/xororz/local-dream
- stable-diffusion.cpp (proyecto base del que se compila el motor): https://github.com/happyyzy/stable-diffusion.cpp
- backend Hexagon de ggml: no disponible (no se proporciona URL concreta)
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
