# yushengsu/Qwen3-8B-5layer-MoE-8E4A-FFN24576-v1

## Resumen

El modelo `yushengsu/Qwen3-8B-5layer-MoE-8E4A-FFN24576-v1` es un modelo borrador (*draft model*) para decodificacion especulativa sobre el modelo objetivo `Qwen/Qwen3-8B`. No es un modelo de proposito general: es una pieza de infraestructura de inferencia que se emplea para acelerar la generacion del modelo grande prediciendo varios tokens de golpe y validandolos despues contra el modelo objetivo. Lo desarrolla el usuario yushengsu (yushengsu-thu en GitHub) y se ha entrenado con SpecForge, un framework de entrenamiento de borradores especulativos, en su variante DSpark.

La particularidad tecnica es que, pese a tener solo 5 capas, cada FFN es una capa Mixture-of-Experts con 8 expertos de anchura 24576 y 4 expertos activos por token, sin experto compartido. Esto da 12,45 mil millones de parametros totales y 6,41 mil millones activos, frente al contrapunto denso equivalente con un unico FFN de anchura 98304. El objetivo es maximizar la tasa de aceptacion del borrador en decodificacion especulativa manteniendo un coste por token bajo.

Es relevante ahora porque la decodificacion especulativa se ha convertido en una de las tecnicas estandar para reducir la latencia de inferencia de LLM en produccion, y el ecosistema de borradores para la familia Qwen3 es aun escaso. No obstante, su adopcion esta condicionada a un fork concreto del codigo de servicio, lo que limita su uso fuera de ese entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 5 capas y FFN de tipo MoE (8 expertos, top-4, sin experto compartido); atencion 32 cabezas Q / 8 cabezas KV de 128 dimensiones con q/k norm; proyector fc 20480->4096 sobre capas objetivo 1/9/17/25/33; cabeza Markov de rango 256; bloque de 16 |
| Parametros totales | 12,45 B |
| Parametros activos | 6,41 B |
| Longitud de contexto | 8192 tokens (contexto de entrenamiento); no se especifica la ventana maxima de servicio |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio expone el checkpoint como `1ep/` al finalizar la epoca) |

## Arquitectura y entrenamiento

El borrador es un transformer de 5 capas que sustituye el FFN denso por una capa MoE con 8 expertos de anchura 24576 y enrutamiento top-4, sin experto compartido. La atencion usa 32 cabezas de consulta y 8 de clave/valor de 128 dimensiones con normalizacion q/k. Ademas incorpora un proyector fc de 20480 a 4096 que toma caracteristicas de las capas 1, 9, 17, 25 y 33 del modelo objetivo, una cabeza Markov de rango 256 y un tamano de bloque de 16. El contrapunto denso declarado por el autor es un unico FFN de anchura 98304.

El entrenamiento se realizo durante una sola epoca sobre prompts de "perfectblend regen" con temperatura 0 y modo no-think, contexto de 8192 tokens y plantilla qwen3-instruct sin prompt de sistema. Se uso un learning rate de 6e-4 con decaimiento coseno y un 4 % de warm-up, 144 muestras por paso de optimizador (12 rangos x 3 x 4), 9867 pasos en total, Liger RMSNorm y cuatro nodos GB300 con 4x GPU cada uno. El codigo de entrenamiento corresponde a una pull request del repositorio SpecForge y a una configuracion concreta (`configs/qwen3-8b-5layer-moe8x24576-8A4-dspark.json`). El servicio requiere el paquete `dev-moe-serving` del fork, con las clases `Qwen3MoeDSparkModel`, el renombrado de `gate.selection_bias` a `gate.expert_bias` y la opcion `dflash_config.moe_router_enable_expert_bias: true`.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre `Qwen/Qwen3-8B`: no genera respuestas autonomamente, propone secuencias que el modelo objetivo valida.
- Prediccion multi-token por bloque de 16, lo que permite al sistema de inferencia aceptar varios tokens por paso de verificacion.
- Integracion de caracteristicas intermedias del modelo objetivo mediante el proyector fc sobre las capas 1, 9, 17, 25 y 33.
- Cabeza Markov de rango 256 para modelar dependencias entre tokens consecutivos dentro del bloque propuesto.
- Enrutamiento MoE top-4 sobre 8 expertos, que reduce el coste por token respecto al contrapunto denso.
- Soporte de tool calling, agentes, vision, audio o razonamiento multi-paso: no disponible (el modelo no expone estas capacidades por si mismo).
- Capacidades multilingues: no disponible.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: el borrador propone bloques de hasta 16 tokens que el modelo objetivo verifica en paralelo, reduciendo el numero de pasos autorregresivos necesarios y, con ello, la latencia por token generado.
- Servicio de chat de baja latencia: al integrarse en el mismo pipeline que Qwen3-8B, permite mantener la calidad del modelo grande mientras se disminuye el tiempo hasta el primer token en flujos conversacionales multi-turno.
- Despliegue en infraestructura con GPUs GB300 o similar: el entrenamiento se realizo en nodos GB300 4x, por lo que el borrador esta pensado para entornos de datacenter con ese perfil de hardware.
- Experimentacion en investigacion sobre decodificacion especulativa: sirve como referencia para estudiar el efecto de sustituir el FFN denso del borrador por un MoE top-4 en la tasa de aceptacion.
- Generacion de codigo asistida con Qwen3-8B como modelo base: al acelerar la decodificacion, mejora la experiencia en autocompletado y generacion de fragmentos largos donde la latencia es critica.
- Evaluacion comparativa de arquitecturas de borradores: el autor declara un contrapunto denso equivalente (FFN de 98304), lo que permite medir el compromiso entre parametros activos y tasa de aceptacion en un mismo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia de orden de magnitud, 12,45 B parametros totales en precision de 16 bits suponen aproximadamente 25 GB de pesos, y en 8 bits unos 12,5 GB, sin contar cache KV ni el modelo objetivo que debe residir en paralelo.
- GPU recomendadas: el autor entreno con cuatro nodos GB300 de 4x GPU; para servicio se requiere un entorno capaz de alojar simultaneamente el borrador y `Qwen/Qwen3-8B`, por lo que se recomienda A100, H100, H200 o GB300.
- Cabe en GPU de consumo: no disponible; condicionado a la cuantizacion y a la convivencia con el modelo objetivo.
- Opciones de despliegue: requiere el fork de SpecForge con el paquete `dev-moe-serving` y la clase `Qwen3MoeDSparkModel`; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yushengsu/Qwen3-8B-5layer-MoE-8E4A-FFN24576-v1 | 12,45 B totales / 6,41 B activos | 8192 (entrenamiento) | Borrador especulativo MoE | Apache 2.0 | Hugging Face, requiere fork de servicio |
| Contrapunto denso del autor (FFN 98304) | no disponible | no disponible | Borrador especulativo denso | no disponible | Referencia en la model card, sin repositorio publico indicado |
| Borradores especulativos genericos para Qwen3-8B | no disponible | no disponible | Borrador especulativo | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de proposito general: no debe usarse para generar respuestas directamente, solo como borrador en decodificacion especulativa.
- El servicio depende de un fork concreto de SpecForge (`dev-moe-serving`) con cambios de API (`gate.expert_bias`, `dflash_config.moe_router_enable_expert_bias`), lo que dificulta su integracion en stacks estandar.
- El contexto de entrenamiento documentado es de 8192 tokens; no se garantiza comportamiento correcto mas alla de esa longitud.
- El entrenamiento se realizo con prompts de temperatura 0 y modo no-think, por lo que la distribucion de entrenamiento no cubre muestreo estocastico ni modo thinking.
- No se documentan idiomas soportados ni evaluaciones de sesgo; el riesgo de alucinacion recae en el modelo objetivo, no en el borrador.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del fork de servicio puede condicionar el despliegue en produccion.
- Sin descargas ni likes en el momento de la ficha (0 y 0), y creado y actualizado el mismo dia: no hay evidencia de validacion externa ni de uso en produccion.
- No se han publicado benchmarks de tasa de aceptacion ni de speedup, que son las metricas relevantes para este tipo de modelo.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-8E4A-FFN24576-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Pull request de SpecForge con el codigo de entrenamiento: https://github.com/yushengsu-thu/SpecForge/pull/22
- Configuracion del borrador: `configs/qwen3-8b-5layer-moe8x24576-8A4-dspark.json` en el repositorio de SpecForge
