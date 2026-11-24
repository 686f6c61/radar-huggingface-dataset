# werr-lab/fns-core-24b

## Resumen

FNS Core 24B es un modelo publicado por werr-lab bajo el paraguas de Fractal Neural Synthesis (FNS), una propuesta que sustituye las matrices de pesos estáticas de complejidad O(N) por una síntesis determinista de pesos generada en tiempo de ejecución a partir de una semilla de coordenadas cuadráticas complejas de 24 bytes, `Θ = (cₓ, cᵧ, zoom)`, bajo la iteración `f_c(z) = z² + c`. El modelo se distribuye con la librería `werrio` y está orientado a inferencia en dispositivos embebidos, con énfasis en ARM Cortex-M4.

A pesar de la nomenclatura "24B" del identificador, la model card no documenta un recuento de parámetros en el sentido convencional de un transformer: el dato central que declara el autor es un almacenamiento persistente de 24 bytes (tres `float64`) y una huella en placa de 1.326 bytes de Flash para una implementación en punto fijo Q16.16 sobre Cortex-M4. El autor enmarca el modelo explícitamente como un sistema de tipo System-1 (reflejos deterministas y controladores embebidos), complementario y no sustitutivo de los LLM de tipo System-2.

La relevancia del artefacto es, por tanto, conceptual y de verificación formal más que de rendimiento en tareas generativas: incluye una prueba mecanizada en Lean 4 sobre el cierre del subideal principal en `ZMod 9` (`I₃ = {0, 3, 6}`) y sobre la seguridad frente a desbordamiento en Q16.16, con cero `sorry`. No se han publicado resultados de benchmarks de lenguaje, razonamiento o código en la información disponible, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fractal Neural Synthesis (FNS): síntesis procedural determinista de pesos a partir de una semilla de coordenadas cuadráticas complejas; no se especifica una topología de transformer |
| Parametros totales | no disponible (el identificador comercial es "24B", pero la model card no declara un recuento de parámetros) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Punto fijo Q16.16 documentado para la implementación en Cortex-M4; no se listan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | BSL 1.1 (`license: other`, `license_name: bsl-1.1`) |
| Formato de pesos | no disponible (almacenamiento persistente declarado: 24 bytes, 3 × `float64`; distribución vía paquete `werrio`) |

## Arquitectura y entrenamiento

La arquitectura se describe como síntesis neural fractal: en lugar de almacenar matrices de pesos de tamaño O(N), el modelo deriva sus pesos de forma determinista y en tiempo de ejecución a partir de la semilla `Θ = (cₓ, cᵧ, zoom)` mediante la iteración del mapa cuadrático complejo `f_c(z) = z² + c`. El resultado declarado es un almacenamiento persistente constante O(1) de 24 bytes, independiente del tamaño efectivo de la red sintetizada.

La model card no proporciona información sobre el proceso de entrenamiento: no se documentan volúmenes de tokens, composición del dataset, etapas de ajuste supervisado, RLHF ni DPO. La innovación técnica destacable no es de entrenamiento sino de verificación y despliegue: una implementación en punto fijo Q16.16 para ARM Cortex-M4 con 1.326 bytes totales de Flash (`.text = 1.302 B`, `.rodata = 24 B`, `.bss = 0 B`) y una verificación formal en Lean 4 del cierre del subideal principal en `ZMod 9` (`I₃ = {0, 3, 6}`) junto con la seguridad frente a desbordamiento en Q16.16, sin `sorry`. El autor acota explícitamente el alcance epistémico del modelo a fronteras de reflejo deterministas y controladores embebidos, limitado por la capacidad de Shannon y Kolmogorov.

## Capacidades

- Síntesis determinista de pesos en tiempo de ejecución a partir de una semilla de 24 bytes, sin almacenamiento de matrices de pesos estáticas.
- Inferencia en punto fijo Q16.16 sobre microcontroladores ARM Cortex-M4 con huella de Flash de 1.326 bytes.
- Comportamiento de tipo System-1: respuestas de reflejo deterministas y controladores embebidos, según la delimitación explícita del autor.
- Verificación formal mecanizada en Lean 4 de propiedades algebraicas (`ZMod 9`) y de seguridad aritmética (desbordamiento Q16.16).
- Generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling, agentes, razonamiento multi-paso y capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Controladores embebidos de lazo cerrado: el modelo está diseñado para ejecutarse en un Cortex-M4 con 1.326 bytes de Flash, lo que permite integrar lógica de decisión de reflejo en firmware con restricciones extremas de memoria.
- Despliegue en microcontroladores sin DRAM externa: con `.bss = 0 B`, el estado persistente no requiere RAM estática adicional, lo que simplifica el arranque y el mapa de memoria del firmware.
- Sistemas con requisitos de determinismo y auditabilidad: la derivación determinista de pesos a partir de una semilla fija facilita reproducir bit a bit el comportamiento en cada arranque.
- Componentes de seguridad certificable: la verificación en Lean 4 del cierre del subideal y de la ausencia de desbordamiento en Q16.16 aporta artefactos de prueba mecanizada útiles en procesos de assurance de firmware crítico.
- Investigación en representaciones compactas de redes: sirve como banco de pruebas para estudiar los límites de capacidad de Shannon y Kolmogorov en modelos con almacenamiento O(1).
- Educación y experimentación en aritmética de punto fijo: la implementación mínima en Q16.16 y el playground en navegador permiten explorar el mapa `f_c(z) = z² + c` y su uso como generador de pesos sin infraestructura de GPU.
- Prototipado de fronteras de reflejo en robótica de bajo consumo: el autor lo plantea como complemento a LLM de tipo System-2, delegando en el modelo las respuestas inmediatas y deterministas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de ingeniería verificadas:

| Metrica | Valor |
|---|---|
| Almacenamiento persistente | 24 bytes (3 × `float64`, O(1)) |
| Flash total en ARM Cortex-M4 (Q16.16) | 1.326 bytes |
| `.text` | 1.302 bytes |
| `.rodata` | 24 bytes |
| `.bss` | 0 bytes |
| Verificación formal Lean 4 | `ZMod 9` subideal principal `I₃ = {0, 3, 6}`; seguridad de desbordamiento Q16.16; 0 `sorry` |

No se dispone de datos de MMLU, HumanEval, GSM8K ni de métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable según la información disponible; el modelo declara almacenamiento persistente de 24 bytes y no requiere pesos en memoria de vídeo.
- Hardware de referencia documentado: ARM Cortex-M4 en punto fijo Q16.16, con 1.326 bytes de Flash y 0 bytes de `.bss`.
- GPU recomendadas: no disponibles; no se documenta soporte de CUDA ni de aceleradores de datacenter (A100, H100, RTX 4090).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: paquete `werrio` (`pip install werrio`) y playground en navegador alojado en Hugging Face Spaces; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (síntesis procedural de pesos o inferencia en microcontroladores), ni datos de rendimiento que permitan establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Alcance acotado por diseño: el autor limita el modelo a fronteras de reflejo deterministas y controladores embebidos, explícitamente complementario a los LLM de tipo System-2 y no sustitutivo de ellos.
- Capacidad limitada por los cotos de Shannon y Kolmogorov: con 24 bytes de semilla, la información efectivamente almacenada es constante, lo que restringe el repertorio de comportamientos representables.
- Ausencia de datos de evaluación: no hay benchmarks de lenguaje, razonamiento ni código, ni métricas de latencia o throughput publicadas.
- Idiomas soportados no documentados: no se puede confirmar cobertura multilingüe ni calidad en ningún idioma.
- Contexto no documentado: no se declara longitud de ventana, por lo que no es posible planificar cargas de trabajo conversacionales o de contexto largo.
- Licencia BSL 1.1: es una licencia de tipo Business Source, con posibles restricciones de uso comercial o de producción que deben revisarse en el enlace de licencia antes de cualquier despliegue; no es una licencia de código abierto aprobada por la OSI.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 interacciones, y la librería `werrio` no figura entre las librerías estándar del ecosistema, lo que implica un riesgo elevado de soporte y mantenimiento.
- Riesgo de alucinación y sesgos: no evaluables con la información disponible, dado que no se documentan datos de entrenamiento ni evaluaciones de comportamiento.
- Nomenclatura potencialmente engañosa: el sufijo "24B" del identificador no está respaldado por un recuento de parámetros declarado en la model card; conviene no interpretarlo como un modelo de 24.000 millones de parámetros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/werr-lab/fns-core-24b
- Playground en navegador: https://huggingface.co/spaces/werr-lab/fractal-neural-synthesis-playground
- Monografía fundacional (v4.0), DOI Zenodo: https://doi.org/10.5281/zenodo.22774934
- Monografía en SSRN: https://papers.ssrn.com/abstract=7659198
- Artículo de verificación formal: https://arxiv.org/abs/2609.33066
- Licencia BSL 1.1: https://github.com/pCwOrM/werr/blob/main/LICENSE
