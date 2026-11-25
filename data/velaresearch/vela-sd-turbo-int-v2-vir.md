# velaresearch/vela-sd-turbo-int-v2-vir

## Resumen

Vela sd-turbo-int v2 VIR es un artefacto de inferencia derivado de `stabilityai/sd-turbo`, el modelo de difusion de un solo paso y 512x512 de Stability AI. La conversion la publica el usuario `velaresearch` en formato VIR (Vela Intermediate Representation), un contenedor propio orientado a la generacion y verificacion de pruebas de inferencia dentro de la red Vela. No se trata de un modelo de lenguaje ni de un transformer generativo de texto: es un modelo de difusion de imagenes empaquetado para un protocolo de consenso concreto.

El artefacto corresponde al modelo de consenso registrado con id 256 y a la variante de payload v3-v4 (Fork-M). El repositorio incluye dos ficheros: el contenedor completo de pesos (`sd-turbo-int.vir`, unos 1,19 GB) y un esqueleto autenticado (`sd-turbo-int.skeleton.vir`, unos 10 MB) que permite a los validadores verificar pruebas sin disponer de los pesos completos. El latente declarado es de 4 x 64 x 64, que produce una salida de 512 x 512 pixeles.

Su relevancia es acotada y muy especifica: no compite con modelos de difusion de proposito general, sino que sirve como pieza de infraestructura para mineros y validadores de la red Vela. La model card no documenta arquitectura interna, datos de entrenamiento ni evaluaciones de calidad de imagen; toda la informacion disponible gira en torno al formato de contenedor, los hashes y los comandos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion de un solo paso (derivada de sd-turbo); no disponible el detalle interno de la conversion VIR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagenes) |
| Tipos de cuantizacion | no disponible; el nombre del artefacto sugiere una variante entera ("int"), sin detalle publicado |
| Idiomas soportados | no disponible |
| Licencia | other (remite a la licencia de stabilityai/sd-turbo) |
| Formato de pesos | VIR (Vela Intermediate Representation): `.vir` completo y `.skeleton.vir` |
| Tamano del repositorio | 1,2 GB |
| Resolucion de salida | 512 x 512 (latente 4 x 64 x 64) |
| Identificador de modelo en registro | 256 |
| Hash de modelo (registro) | `4539e064ca8b7197e5c39e86a3e1454b632c62faade38b2ffb13b3875c08e6ad` |

## Arquitectura y entrenamiento

El modelo subyacente es `sd-turbo`, un modelo de difusion de Stability AI disenado para generar imagenes en un unico paso de inferencia a 512 x 512. Sobre esa base, `velaresearch` ha producido una conversion al formato VIR, un contenedor propietario de la red Vela pensado para ejecutar y verificar inferencias en un contexto de consenso distribuido. La model card no describe la arquitectura interna de la conversion, el esquema de cuantizacion entera ni el proceso de destilacion o entrenamiento aplicado.

La informacion tecnica disponible se limita al empaquetado: dos ficheros con sus tamanos y hashes SHA-256, el hash de registro del modelo, el identificador 256 y las dimensiones del latente. No se publican datos sobre tokens de entrenamiento, composicion del dataset, RLHF/DPO ni innovaciones de atencion, porque no aplican a un modelo de difusion ni se han documentado. Cabe destacar que el SHA-256 del fichero completo no coincide con el hash de registro del modelo, una distincion que la propia model card senala de forma explicita.

## Capacidades

- Generacion de imagenes de 512 x 512 en un unico paso de inferencia, heredada de `sd-turbo`.
- Produccion de pruebas de inferencia ("proof-of-inference") para la red Vela mediante `vela-miner`.
- Verificacion de pruebas por parte de validadores usando solo el esqueleto autenticado, sin necesidad de los pesos completos.
- Reproduccion completa en nodos de mineria mediante el modo `poimodel3`.
- No se documentan capacidades de texto, codigo, matematicas, vision por comprension, tool calling, agentes ni multilingues.

## Casos de uso

- Mineria en la red Vela: un operador ejecuta `vela-miner --chain testnet4 --model sd-turbo-int.vir --model-id 256` para generar pruebas de inferencia con el modelo de consenso registrado.
- Validacion ligera: un validador arranca `velad -testnet4 -poiskeleton=256:...` y verifica el payload v4 sin descargar los 1,19 GB de pesos, reduciendo el consumo de disco y ancho de banda.
- Reproduccion completa en nodos de mineria: el modo `poimodel3` permite reconstruir y comprobar la inferencia completa sobre el contenedor de pesos.
- Infraestructura de testnet: el identificador de cadena `testnet4` sugiere su uso en entornos de prueba de la red antes de un despliegue en produccion.
- Distribucion verificable de modelos: los hashes publicados (fichero y registro) permiten auditar la integridad del artefacto en pipelines de despliegue automatizados.
- Generacion de imagenes de 512 x 512 en el contexto del protocolo Vela: cualquier flujo que requiera el modelo de consenso id 256 puede invocar esta variante entera en lugar de la version original en formato diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el contenedor de pesos ocupa 1,19 GB, por lo que el requisito de memoria en GPU sera del orden de unos pocos GB, pero no se documenta una cifra oficial.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del artefacto sugiere que cabria en GPU de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: cliente `vela-miner` (mineros) y demonio `velad` (validadores) de la red Vela, en cadenas `testnet4`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vela-sd-turbo-int-v2-vir (este) | Difusion de un paso, conversion VIR | no disponible | 512 x 512 | VIR | other (remite a sd-turbo) | Hugging Face, 0 descargas |
| stabilityai/sd-turbo | Difusion de un paso | no disponible en esta ficha | 512 x 512 | safetensors / diffusers | Stability AI Community License (u otra, segun el modelo base) | Hugging Face, ampliamente usado |
| Otras conversiones VIR de Vela | Difusion empaquetada para proof-of-inference | no disponible | no disponible | VIR | other | no disponible |

La comparacion directa con modelos de difusion de proposito general no es homogenea: este artefacto esta atado a un protocolo de consenso concreto y no se distribuye como modelo listo para usar con librerias estandar de difusion.

## Limitaciones y advertencias

- La licencia es "other" y remite a la de `stabilityai/sd-turbo`; es imprescindible revisar los terminos del modelo base antes de cualquier uso comercial.
- El artefacto esta disenado para la red Vela; no es un modelo de difusion de uso general y no se documenta su compatibilidad con herramientas estandar como diffusers.
- No se publican datos de arquitectura interna, cuantizacion, datos de entrenamiento ni evaluaciones de calidad, por lo que no es posible estimar sesgos ni fidelidad de imagen a partir de la informacion disponible.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados para esta conversion; los del modelo base no se trasladan necesariamente de forma identica tras la conversion entera.
- El SHA-256 del fichero completo no es el hash de registro del modelo; confundirlos puede invalidar la verificacion.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validacion comunitaria y de casos de uso publicos contrastados.
- No se especifican idiomas soportados ni limitaciones de contexto, ya que no aplican a un modelo de difusion de imagenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/velaresearch/vela-sd-turbo-int-v2-vir
- Modelo base: https://huggingface.co/stabilityai/sd-turbo
- Licencia del modelo base: https://huggingface.co/stabilityai/sd-turbo
