# tanepiper/termite-decide-0.8b

## Resumen

termite-decide-0.8b es un modelo de decisión de 0,8 mil millones de parámetros desarrollado por tanepiper para [termite](https://github.com/tanepiper/termite), una herramienta que traduce lenguaje natural a comandos de shell y evalúa su seguridad antes de ejecutarlos. El modelo no genera texto libre: recibe un comando de shell y responde a tres preguntas binarias (si solo lee, si mantiene ocultos los secretos y si podría causar daño), además de poder ordenar varias alternativas de comando. Su función en el sistema es exclusivamente restrictiva: solo puede endurecer el veredicto de las reglas deterministas de termite, nunca aprobar lo que dichas reglas rechazan.

Técnicamente es un ajuste fino mediante LoRA (rango 16, con una cabeza de puntero) sobre jaredpalmer/kev-0.8b, que a su vez deriva de Qwen/Qwen3.5-0.8B-Base. Se distribuye únicamente como GGUF en cuantización Q8_0 (812 MB) y está pensado para ejecutarse en local con llama.cpp, lo que lo hace adecuado para entornos de escritorio y flujos de trabajo donde la latencia y la privacidad importan.

Su relevancia radica en el nicho: es un clasificador especializado de seguridad de comandos shell, con una licencia Apache 2.0 permisiva y un tamaño que cabe en cualquier máquina. La versión 0.1 es explícitamente una línea base: alcanzó un Tau de 0,698 frente al objetivo de 0,703, y el propio autor documenta fallos conocidos en la detección de comandos peligrosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B-Base) con cabeza de puntero sobre LoRA r=16 |
| Parametros totales | 752.917.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de despliegue de la model card) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado) |
| Idiomas soportados | en (solo ingles; no se probo ningun otro idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (termite-decide-0.8b-0.1-Q8_0.gguf, 812 MB) |

## Arquitectura y entrenamiento

El modelo parte de jaredpalmer/kev-0.8b (revision `bf75a6a8848ea6960ff2ed108d9ed44c2941174f`), construido sobre Qwen/Qwen3.5-0.8B-Base (revision `dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68`), ambos bajo Apache 2.0. Sobre esa base se aplico un ajuste fino con LoRA de rango 16 y una cabeza de puntero, en una sola pasada con tamano de lote 8. El modelo no genera texto: emite decisiones seleccionadas de un conjunto fijo de opciones.

Los datos de entrenamiento consisten en 15.990 filas no publicadas, provenientes de los datasets NL2SH-ALFA (MIT) y nl2shell-training-v3 (Apache 2.0), mas filas escritas a mano. Las etiquetas las generaron las propias reglas de termite; se descartaron las filas que las reglas no podian responder y las que coincidian con el conjunto de test. Para la evaluacion se retuvieron programas completos (no solo lineas), lo que mide la generalizacion a programas no vistos. La conversion a GGUF se hizo con `convert_hf_to_gguf.py` de llama.cpp en Q8_0.

## Capacidades

- Clasificacion de seguridad de comandos shell en tres ejes binarios: solo lectura, ocultacion de secretos y potencial de dano.
- Asignacion de un nivel de riesgo segun la escalera de seguridad de termite (1 a 5, siendo 1 el orden correcto y 0 aleatorio en la metrica Tau).
- Ordenacion (ranking) de varias alternativas de comando para seleccionar la mas segura.
- Integracion con el servidor de termite mediante el endpoint `/v1/systemone`.
- No genera texto libre; sus salidas son selecciones de opciones fijas.
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso: no disponible como tal; su rol es de verificacion dentro del pipeline de termite.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: modo thinking, vision o audio: no disponible.

## Casos de uso

- Validacion previa de comandos generados por un LLM: en un pipeline que traduzca lenguaje natural a shell, termite-decide actua como segunda capa de comprobacion antes de ejecutar, endureciendo el veredicto de las reglas deterministas cuando detecta riesgo.
- Asistentes de terminal con ejecucion segura: integrado en una CLI que proponga comandos al usuario, el modelo permite marcar en rojo operaciones que abren listeners de red, manipulan contrasenas o cambian de usuario, que son precisamente los fallos documentados en la model card.
- Entornos de desarrollo con datos sensibles: al ejecutarse en local via llama.cpp, evita enviar comandos que puedan contener rutas o credenciales a servicios en la nube.
- Seleccion entre alternativas de comando: cuando el generador produce varias opciones, el modelo puede ordenarlas para que el usuario elija la mas segura, aunque su rendimiento en esta tarea es debil (4 de 10 aciertos en el primer puesto).
- Auditoria de scripts existentes: dado un comando concreto y un contexto de carpeta, el modelo puntua el riesgo relativo, util para revisiones automatizadas en CI sobre scripts de despliegue.
- Formacion y simulacion de politicas de seguridad: el modelo y su escalera de seguridad sirven como banco de pruebas para calibrar reglas de termite antes de desplegarlas en produccion.

## Benchmarks y rendimiento

Resultados publicados en la model card (version 0.1):

| Medida | Resultado |
|---|---|
| Tau (orden de las puntuaciones de dano frente a la escalera de seguridad) | 0,698 |
| Objetivo de Tau (superar Kev-4B, 0,703) | No alcanzado (fallo por 0,005) |
| Comandos de nivel 3 o superior calificados como seguros | 0 |
| Comandos inofensivos calificados como seguros | 14 de 14 |
| Comandos de nivel 2 calificados como seguros | 8 (las reglas tambien permitirian 7 de ellos) |
| Carpeta de mayor riesgo puntuada mas alto para el mismo comando | 11 de 11 |
| Opcion mas segura clasificada primera | 4 de 10 |

Comparativa de Tau con otros modelos de la misma familia:

| Modelo | Tamano | Tau |
|---|---|---|
| JevK5 | 9B | 0,779 |
| Kev-9B | 9B | 0,72 |
| Kev-4B | 4B | 0,703 |
| termite-decide 0.1 | 0,8B | 0,698 |
| tev1 | 4B | 0,68 |
| Kev-0.8B (punto de partida) | 0,8B | 0,548 |

Resultados en filas de programas no vistos durante el entrenamiento, usando el archivo Q8_0:

| Pregunta | Errores peligrosos |
|---|---|
| Comando danino clasificado como inofensivo | 20 de 307 |
| Cambio clasificado como solo lectura | 4 de 618 |
| Comando que muestra secretos clasificado como seguro | 2 de 27 |
| Primera opcion coincidente con el mejor comando | 122 de 138 |

El autor advierte que estas etiquetas provienen de las reglas de termite, por lo que demuestran que el modelo aprendio las reglas, no que las reglas sean correctas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,8-1 GB para el archivo Q8_0 de 812 MB, mas overhead del contexto; cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso CPU; el modelo es de 0,8B y no requiere aceleradores de datacenter.
- Despliegue: llama.cpp (`llama-server`) es el unico backend probado por el autor. El comando documentado es `llama-server -hf tanepiper/termite-decide-0.8b:Q8_0 -c 4096 --port 9931`.
- Endpoint requerido: el servidor debe exponer `/v1/systemone`, propio de termite; no es compatible con la API estandar de OpenAI sin adaptacion.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tau | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| termite-decide 0.1 | 0,8B | 0,698 | Apache 2.0 | GGUF Q8_0 en Hugging Face |
| Kev-0.8B | 0,8B | 0,548 | Apache 2.0 (heredada) | Modelo base en Hugging Face |
| Kev-4B | 4B | 0,703 | no disponible | no disponible |
| Kev-9B | 9B | 0,72 | no disponible | no disponible |
| JevK5 | 9B | 0,779 | no disponible | no disponible |
| tev1 | 4B | 0,68 | no disponible | no disponible |

La comparativa se limita a los modelos de la propia familia Kev, ya que la informacion proporcionada no incluye alternativas externas de clasificacion de seguridad de comandos shell.

## Limitaciones y advertencias

- Omite comandos daninos: fallo en 20 de 307 casos, incluyendo herramientas que abren listeners de red, utilidades de contrasenas y formas de cambio de usuario.
- Rendimiento debil en ordenacion: la opcion mas segura quedo primera solo en 4 de 10 casos.
- No debe usarse como unica comprobacion de seguridad: el autor indica explicitamente que un comando disenado para enganar al modelo puede superarlo.
- Solo puede endurecer el veredicto de las reglas de termite; nunca aprobar lo que estas rechazan.
- La escalera de seguridad usada para evaluar tiene solo 52 comandos y fue leida en detalle durante el desarrollo; una ejecucion posterior obtuvo 0,666, y una diferencia de 0,005 es demasiado pequena para ser significativa.
- La escalera se ejecuto en macOS; las mismas filas retenidas se comprobaron de nuevo en Linux.
- Solo ingles: no se probo ningun otro idioma.
- Solo se publica Q8_0; no hay variantes de menor precision ni pesos en safetensors.
- La licencia Apache 2.0 cubre los pesos del modelo, pero no altera las licencias de las fuentes de datos (NL2Bash es GPL-3.0, tldr-pages es CC BY 4.0, InterCode es MIT, y varios datasets no declaran licencia).
- Riesgo de alucinacion en el sentido de falsos negativos de seguridad: clasificar como seguro un comando que no lo es.
- Sesgos conocidos: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tanepiper/termite-decide-0.8b
- Repositorio termite: https://github.com/tanepiper/termite/tree/main
- Especificacion de evaluacion de modelos de termite: https://github.com/tanepiper/termite/blob/main/specs/2026-11-05-model-grading/spec.md
- Documentacion de la escalera de seguridad: https://tanepiper.github.io/termite/docs/safety-ladder/
- Modelo base jaredpalmer/kev-0.8b: https://huggingface.co/jaredpalmer/kev-0.8b
- Modelo base Qwen/Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Dataset NL2SH-ALFA: https://huggingface.co/datasets/westenfelder/NL2SH-ALFA
- Dataset nl2shell-training-v3: https://huggingface.co/datasets/AryaYT/nl2shell-training-v3
- NL2Bash: https://github.com/TellinaTool/nl2bash
- tldr-pages: https://github.com/tldr-pages/tldr
- InterCode: https://github.com/princeton-nlp/intercode
