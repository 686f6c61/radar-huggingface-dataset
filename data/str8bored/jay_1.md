# str8bored/JAY_1

## Resumen

JAY_1 es un adaptador LoRA de un solo archivo, publicado por el usuario str8bored, que se monta sobre ACE-Step v1.5 turbo, un modelo de generacion de audio a partir de texto orientado a musica. No es un modelo completo ni un modelo entrenado desde cero: es un adaptador PEFT que sesga la generacion del modelo base hacia una interpretacion vocal masculina, una estructura lirica mas legible y un timbre mas humano y emocional, ademas de suprimir la fuga de voz femenina que aparece cuando el prompt no la solicita.

El adaptador se entrena contra el diseno de pesos original de la variante turbo de 2B parametros y no es compatible con la variante XL de 4B, para la que el autor publica un adaptador distinto (JAY_2). La relevancia de esta ficha es acotada: se trata de un ajuste direccional, pequeno y barato, pensado para empujar cuatro comportamientos concretos sin reescribir el prompt del usuario, y distribuido bajo licencia CC0-1.0, lo que elimina practicamente cualquier friccion de uso comercial.

En el momento de redactar esta ficha, el repositorio registra 0 descargas y 0 likes y ocupa 0.0 GB, con fecha de creacion y ultima actualizacion del 4 de octubre de 2026. No se ha publicado informacion sobre benchmarks objetivos, datos de entrenamiento ni requisitos de hardware especificos mas alla de los derivados del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (Low-Rank Adaptation) sobre ACE-Step v1.5 turbo; rango r=32, alpha=64 (factor de escala 2.0) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base ACE-Step v1.5 turbo declara 2B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors |
| Idiomas soportados | no disponible (los prompts de ejemplo de la model card estan en ingles) |
| Licencia | cc0-1.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json, formato PEFT |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango que se acopla a ACE-Step v1.5 turbo en su variante `acestep-v15-turbo` (2B). El autor declara explicitamente una configuracion `r: 32` con `lora_alpha: 64`, lo que produce un factor de escala de 2.0 en PEFT: la fuerza efectiva del adaptador es el doble del valor que se introduzca en el control deslizante de la interfaz. El repositorio contiene unicamente los pesos del adaptador y el fichero de configuracion PEFT; no incluye dataset, tensores preprocesados ni script de entrenamiento, y el autor lo describe como un artefacto exclusivamente de inferencia, no como un release de post-entrenamiento.

El adaptador se entreno contra el diseno de capas y el tamano oculto del turbo original y no ha sido portado a la arquitectura XL-turbo (4B), que difiere en numero de capas y tamano oculto. El autor describe ese desajuste como estructural, no como un aviso de version: el adaptador sencillamente no enlaza con la variante XL. No se dispone de informacion sobre el volumen de datos, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO en el adaptador o en el modelo base.

## Capacidades

- Generacion de audio musical a partir de texto (pipeline text-to-audio) heredada del modelo base ACE-Step v1.5 turbo.
- Sesgo hacia presencia vocal masculina: el autor estima un desplazamiento de aproximadamente +10% hacia una lectura vocal masculina.
- Supresion de la fuga de voz femenina que suele aparecer por debajo cuando el prompt no la pide, evitando que la pista quede indecisa o duplicada.
- Mejora de la estructura lirica: el autor estima aproximadamente +20% en la legibilidad de la estructura, con fronteras de seccion mas limpias y fraseo mas predecible entre verso y estribillo.
- Empuje hacia un timbre vocal masculino mas humano, cercano a la respiracion y emocionalmente legible, alejandose de la lectura sintetica plana.
- Activacion mediante token prefijo `guy_singing_runs`, que debe colocarse al principio absoluto del prompt.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso ni capacidades multilingues declaradas: es un adaptador de audio, no un modelo de lenguaje de proposito general.

## Casos de uso

- Produccion musical con voz masculina: integrado en el flujo de ACE-Step, permite generar maquetas de rock, pop u otros generos con una interpretacion vocal masculina mas decidida, usando el token `guy_singing_runs` al inicio del prompt junto al genero deseado.
- Generacion de demos previas a grabacion: al empujar la estructura lirica y las fronteras de seccion, resulta util para producir versiones guia con verso y estribillo claramente diferenciados que sirvan de referencia al interprete real.
- Canciones con estructura marcada: el adaptador funciona parcialmente como adaptador de estructura, por lo que es adecuado cuando el prompt incluye etiquetas de seccion tipo `[Intro]`, `[Verse 1]` o `[Chorus]` y se necesita que el modelo las respete.
- Correccion de sesgo de genero en la salida: cuando el modelo base produce voz femenina pese a un prompt que pide voz masculina, este adaptador suprime esa fuga y estabiliza la salida.
- Experimentacion A/B en investigacion de audio: al ser un adaptador de bajo rango y licencia CC0, permite comparar con y sin adaptador sobre el mismo prompt para estudiar el efecto del ajuste en la salida.
- Prototipado rapido en interfaces ACE-Step: se carga como fuente LoRA en la UI o API de ACE-Step, con escala fija 1.0, y no requiere infraestructura adicional mas alla de la del modelo base.
- Generacion de catalogos musicales con voz masculina homogenea: util para producir lotes de pistas con un caracter vocal consistente, siempre que se mantenga el token prefijo y la escala requerida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de +10% en presencia vocal masculina y +20% en legibilidad de estructura proceden, segun el propio autor, de caracterizaciones subjetivas realizadas mediante escucha A/B y no de metricas objetivas; no existe una medida objetiva de "porcentaje mas masculino". No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica estandar, ya que el artefacto es un adaptador de audio y no un modelo de lenguaje.

## Requisitos de hardware

- El repositorio del adaptador ocupa 0.0 GB, por lo que el peso anadido sobre el modelo base es despreciable.
- Los requisitos de VRAM, GPU recomendada y opciones de despliegue vienen determinados por el modelo base ACE-Step v1.5 turbo (2B); no se proporcionan datos especificos de VRAM ni de GPU recomendadas en la informacion disponible.
- No se dispone de informacion sobre si cabe en GPU de consumo ni en que modelos concretos.
- No se dispone de datos sobre latencia ni throughput.
- Opciones de despliegue: carga como fuente LoRA en la interfaz o API de ACE-Step; el adaptador debe colocarse en una carpeta con los ficheros renombrados exactamente como `adapter_model.safetensors` y `adapter_config.json`.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros base | Token de activacion | Escala LoRA | Licencia |
|---|---|---|---|---|---|---|
| JAY_1 | LoRA para ACE-Step v1.5 turbo | ACE-Step/Ace-Step1.5 (acestep-v15-turbo) | 2B | `guy_singing_runs` | 1.0 (unico valor funcional) | cc0-1.0 |
| JAY_2 | LoRA para ACE-Step v1.5 XL-turbo | ACE-Step/Ace-Step1.5 (acestep-v15-xl-turbo) | 4B | `jay_singing_runs` | no disponible | no disponible |
| ACE-Step v1.5 turbo (base) | Modelo text-to-audio | no aplica | 2B | no aplica | no aplica | no disponible |

La comparativa se limita a los artefactos relacionados citados en la propia model card. No se dispone de informacion sobre otros adaptadores comparables de la misma categoria ni de metricas que permitan ordenarlos por rendimiento.

## Limitaciones y advertencias

- La escala del adaptador debe ser exactamente 1.0. Por debajo de ese valor no produce una version mas sutil, sino que degrada hacia ruido estatico; no es utilizable como mezcla gradual.
- No es compatible con `acestep-v15-xl-turbo` (4B). El desajuste es estructural (numero de capas y tamano oculto distintos), no una advertencia de version. Para XL-turbo debe usarse JAY_2.
- Los ficheros deben llamarse exactamente `adapter_model.safetensors` y `adapter_config.json`. Si se renombra cualquiera de ellos, el adaptador no se encuentra y la interfaz ejecuta el modelo base en silencio, sin aplicar el LoRA.
- El token prefijo `guy_singing_runs` debe ir al principio absoluto del prompt. Colocado en otra posicion, la amplificacion se reduce de forma sustancial; no debe incluirse en el bloque de letra. Si se omite, el adaptador se carga pero permanece inerte.
- El token de JAY_1 no activa JAY_2 y falla de forma silenciosa; cada adaptador usa un token distinto.
- Las cifras de mejora (+10% / +20%) son caracterizaciones subjetivas del autor, no medidas objetivas, y deben interpretarse solo como indicacion de direccion y magnitud aproximada.
- Los prompts puramente instrumentales cargan el adaptador sin nada sobre lo que aplicar su sesgo.
- No se dispone de informacion sobre sesgos del modelo base, riesgo de alucinacion en el sentido textual, ni limitaciones de contexto o idioma especificas de este adaptador.
- La licencia CC0-1.0 permite uso comercial sin restricciones conocidas por parte del adaptador; las condiciones del modelo base ACE-Step v1.5 turbo no se detallan en la informacion disponible y deben verificarse aparte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/str8bored/JAY_1
- Adaptador JAY_2 (para XL-turbo): https://huggingface.co/str8bored/JAY_2
- Modelo base ACE-Step v1.5: https://huggingface.co/ACE-Step/Ace-Step1.5
