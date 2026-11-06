# Xionglong/RFD4-Proteina

## Resumen

RFD4-Proteína es un modelo de flow matching para diseno biomolecular desarrollado por el Baker Lab en colaboracion con NVIDIA GenAIR. Genera de forma conjunta secuencias de proteinas y estructuras de todos los atomos, condicionado al contexto molecular que se desea preservar: un diana de union, un motivo enzimatico, un ligando o caracteristicas estructurales seleccionadas. El modelo se distribuye como un bundle nativo con pesos en FP32 y un total de 435.622.465 parametros almacenados.

La relevancia del modelo radica en su enfoque de generacion conjunta de secuencia y estructura, en lugar de tratar ambas tareas por separado. El release actual (2026-10-19) emplea un autoencoder unificado que cubre proteinas, acidos nucleicos y moleculas pequenas, con un vocabulario de 147 clases de residuos y un espacio latente de 32 dimensiones. Esto supone un salto respecto al release anterior, que usaba un vocabulario de 33 clases y un latente de 16 dimensiones.

El modelo se ofrece como un par emparejado compuesto por un modelo de flujo y su autoencoder, que no son intercambiables entre releases. La licencia es BSD 3-Clause y el runtime requiere Linux x86_64, Python 3.12 y una GPU NVIDIA compatible con CUDA 13. El pipeline de Diffusers esta soportado, aunque hasta la proxima release de Diffusers es necesario instalarlo desde GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de flow matching emparejado con autoencoder (par flujo + AE) |
| Parametros totales | 435.622.465 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en FP32) |
| Idiomas soportados | en |
| Licencia | BSD 3-Clause |
| Formato de pesos | safetensors (model.safetensors, 1,74 GB) y checkpoints nativos Lightning (.ckpt) |

## Arquitectura y entrenamiento

RFD4-Proteína es un modelo de flow matching disenado para generar simultaneamente secuencias y estructuras atomicas de biomoleculas. La arquitectura se compone de un modelo de flujo que opera en un espacio latente definido por un autoencoder emparejado. El release actual emplea un autoencoder unificado con vocabulario de 147 clases de residuos (proteinas, acidos nucleicos y moleculas pequenas) y latente de 32 dimensiones. El modelo de flujo de la release 2026-10-19 corresponde al checkpoint base preentrenado (step 320000) con un fine-tune LoRA de rango 32 fusionado, aplicado sobre `to_qkv` y `to_out_node`.

El bundle incluye tanto el modelo de flujo como el autoencoder, que deben usarse siempre como par emparejado de la misma release; mezclar componentes de releases distintos produce resultados sin sentido en lugar de un error. El entrenamiento se realizo sobre el dataset `nvidia/RFD4-Proteina`, disponible en un repositorio separado. El modelo base preentrenado se conserva en `base/` y el adaptador LoRA en formato PEFT en `adapter/`. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion detallada del dataset en la informacion proporcionada.

## Capacidades

- Generacion conjunta de secuencia y estructura de proteinas en formato CIF, con identidades de residuo y coordenadas generadas.
- Diseno biomolecular condicionado a contexto molecular: dianas de union, motivos enzimaticos, ligandos y caracteristicas estructurales seleccionadas.
- Generacion de estructuras de todos los atomos.
- Cobertura de proteinas, acidos nucleicos y moleculas pequenas gracias al autoencoder unificado de 147 clases de residuos.
- Entrada mediante estructuras CIF anotadas o especificaciones de condiciones en YAML.
- Salida de estructuras moleculares disenadas en formato CIF.
- Ejemplos de aplicacion mostrados en el proyecto: complejos de nanobody, binders proteina-ADN, pseudoknots de ARN, bolsillos de ligando, complejos con glicanos y ensamblajes proteicos.
- Soporte de inferencia en Spaces de Hugging Face (ZeroGPU y GPU dedicada).
- No se documenta soporte de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Diseno de binders proteicos: el modelo genera secuencias y estructuras condicionadas a una diana de union, lo que permite proponer candidatos de union con la geometria del complejo ya resuelta en la salida.
- Ingenieria de motivos enzimaticos: partiendo de un motivo estructural conservado, el modelo disena el resto de la proteina manteniendo la geometria del sitio activo, util para rediseno de enzimas.
- Diseno de bolsillos para ligandos: dada la estructura de un ligando, el modelo genera un bolsillo proteico compatible, aplicable en descubrimiento de farmacos.
- Diseno de acidos nucleicos: el autoencoder unificado permite generar estructuras de ARN y ADN, como pseudoknots o binders proteina-ADN.
- Diseno de complejos con glicanos: el modelo puede generar estructuras que incorporan glicanos en el contexto del diseno.
- Prototipado rapido en investigacion: el modelo puede ejecutarse en Spaces de Hugging Face (ZeroGPU o GPU dedicada) para explorar disenos sin infraestructura propia.
- Integracion en pipelines de diseno computacional: mediante el paquete Python RFD4 y el pipeline de Diffusers, los disenos pueden incorporarse a flujos automatizados de evaluacion y filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los pesos se almacenan en FP32 (435,6 M de parametros, `model.safetensors` de 1,74 GB), por lo que la huella de pesos en FP32 ronda los 1,7 GB, a lo que hay que sumar el autoencoder y las activaciones.
- GPU recomendadas: GPU NVIDIA compatible con drivers CUDA 13; no se especifican modelos concretos en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; el requisito declarado es una GPU NVIDIA soportada con CUDA 13.
- Opciones de despliegue: paquete Python RFD4 nativo (`Proteina.from_pretrained`), pipeline de Diffusers (`RFD4ProteinaPipeline.from_pretrained`, Diffusers desde GitHub hasta la proxima release), Spaces de Hugging Face (ZeroGPU y GPU dedicada).
- Sistema operativo y runtime: Linux x86_64, Python 3.12.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni comparativas con otros modelos de diseno proteico que permitan una comparacion rigurosa de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- El modelo de flujo y el autoencoder forman un par emparejado: mezclar componentes de releases distintos produce resultados sin sentido en lugar de un error, lo que puede pasar desapercibido en produccion.
- Los pesos se almacenan en FP32; no se documentan opciones de cuantizacion, lo que limita el despliegue en entornos con restricciones de memoria.
- El modelo esta etiquetado unicamente para el idioma ingles (`en`), aunque su naturaleza es de generacion estructural y no de texto.
- El pipeline de Diffusers requiere instalar Diffusers desde GitHub hasta la proxima release oficial, lo que anade riesgo de cambios en la API.
- El runtime exige Linux x86_64, Python 3.12 y una GPU NVIDIA con driver compatible con CUDA 13, lo que restringe plataformas (por ejemplo, macOS o Windows no estan soportados segun la informacion disponible).
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que no es posible evaluar el rendimiento frente a alternativas de forma cuantitativa.
- Al tratarse de un modelo de diseno biomolecular, los disenos generados requieren validacion experimental; no deben interpretarse como resultados validados.
- La licencia BSD 3-Clause permite uso comercial, pero los assets de terceros opcionales incluidos pueden tener terminos separados que deben revisarse.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xionglong/RFD4-Proteina
- Pagina del proyecto: https://rfd4-proteina.org/
- Documentacion: https://rfd4-proteina.org/latest/
- Codigo: https://github.com/RosettaCommons/RFD4-Proteina
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/RFD4-Proteina
- Pesos Diffusers: https://huggingface.co/nvidia/RFD4-Proteina-Diffusers
- Preprocesamiento Annotated-CIF para Diffusers: https://huggingface.co/nvidia/RFD4-Proteina-prep
- Studio (ZeroGPU): https://huggingface.co/spaces/nvidia/rfd4-proteina-zerogpu
- Studio (GPU dedicada): https://huggingface.co/spaces/nvidia/rfd4-proteina-space
- Pull request de Diffusers: https://github.com/huggingface/diffusers/pull/15088
