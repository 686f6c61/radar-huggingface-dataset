# zrbobozrx/kingdom-come-deliverance-2-trainer-v3

## Resumen

No existe un modelo de IA en el repositorio `zrbobozrx/kingdom-come-deliverance-2-trainer-v3`. El artefacto publicado es un ejecutable de Windows (`kingdom-come-deliverance-2-trainer-v3-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB y protegido con la contraseña `2026`) que se presenta como un "trainer" o herramienta de trampas para el videojuego *Kingdom Come: Deliverance 2*. La model card describe funciones de lectura y escritura de memoria del proceso del juego, superposición externa, suavizado de entrada y perfiles JSON, no capacidades de generacion de lenguaje.

El repositorio no contiene pesos, tokenizador, configuracion de arquitectura ni ningun artefacto relacionado con aprendizaje automatico. Los tags de Hugging Face (`windows`, `windows-11`, `x64`, `portable`) y la ausencia de pipeline confirman que se trata de un binario empaquetado, no de un modelo. Las descargas y los "likes" son cero en la fecha de creacion (24 de noviembre de 2026).

Esta ficha se redacta por rigor documental: un lector que encuentre el repositorio debe saber que no puede evaluarlo como modelo de IA y que su descarga conlleva riesgos de seguridad propios de ejecutables de origen desconocido que manipulan memoria de procesos de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable nativo x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card; no implican capacidades linguisticas del binario) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` con un `.exe`) |

## Arquitectura y entrenamiento

No aplica. El repositorio no documenta ninguna arquitectura de red neuronal, conjunto de datos, proceso de entrenamiento, ajuste por RLHF/DPO ni innovacion algorítmica de aprendizaje automatico. La model card describe un programa de Windows que, segun sus propias afirmaciones, realiza lectura y escritura de memoria de otro proceso ("direct-memory"), resuelve punteros de forma dinamica tras actualizaciones del juego, renderiza una superposicion externa mediante Desktop Duplication y expone un "panic key" (`END`) para descargar el modulo. Son funciones de ingenieria inversa de software, no de modelado estadistico.

No hay informacion sobre volumen de datos, composicion del corpus ni metodologia de evaluacion. Cualquier afirmacion sobre entrenamiento seria inventada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de las APIs de modelos generativos.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los codigos de idioma de la model card son metadatos del repositorio.
- El binario afirma manipular memoria del proceso de *Kingdom Come: Deliverance 2* en Windows 10/11 de 64 bits, con superposicion grafica externa y perfiles de configuracion.
- No se ha verificado de forma independiente ninguna de las capacidades declaradas por el autor.

## Casos de uso

- Ninguno relacionado con IA. El artefacto no sirve para generacion de texto, codigo, atencion al cliente, analisis de datos ni ninguna tarea de procesamiento de lenguaje natural.
- Auditoria de cadena de suministro: un equipo de seguridad puede usar este repositorio como ejemplo de publicacion de binarios en Hugging Face sin trazabilidad de codigo fuente, para calibrar sus politicas de ingesta de artefactos.
- Formacion en deteccion de ingenieria social: la model card emplea patrones tipicos (botones de descarga destacados, contrasena en el texto, insignias de "99% verificado") utiles como material didactico en concienciacion.
- Analisis de malware en entorno aislado: si se desea estudiar el binario, debe hacerse exclusivamente en una maquina virtual sin red y sin credenciales, nunca en un equipo de produccion.
- Documentacion de taxonomias de repositorios: sirve para ejemplificar la diferencia entre un artefacto de software y un modelo, y por que los pipelines de Hugging Face no lo indexan.
- No se recomienda su uso para modificar partidas del juego: infringe habitualmente los terminos de servicio y puede acarrear sanciones en modos multijugador, ademas del riesgo de seguridad del ejecutable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni equivalentes porque el artefacto no es un modelo evaluable. Las cifras que aparecen en la model card (`99.1%` de consistencia, `98.2%`, `475 Hz` de sondeo, `< 5 ms` de respuesta) son afirmaciones del autor sin metodologia, sin conjunto de prueba y sin verificacion externa; no deben interpretarse como rendimiento medido.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, segun la model card.
- Espacio en disco: aproximadamente 8,9 MB para el ZIP; el tamano descomprimido no se detalla.
- VRAM: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica. La model card menciona una superposicion a "144 Hz+" que depende de la tasa de refresco del monitor, no de una GPU concreta.
- Cabe en cualquier equipo consumer con Windows x64; no requiere A100, H100 ni RTX 4090.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna. No es compatible con estos runtimes.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No hay modelos comparables porque el artefacto no pertenece a la categoria de modelos de IA. Frente a un modelo de lenguaje open source real, las diferencias son categoricas: aquel tiene pesos, arquitectura, contexto y licencia de uso sobre el modelo; este es un binario cerrado con licencia MIT declarada sobre un repositorio que no contiene codigo fuente.

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse ni evaluarse como tal en comparativas de modelos.
- Riesgo de seguridad alto: se distribuye un ejecutable de origen no verificado que, segun su propia descripcion, lee y escribe memoria de otros procesos. Puede contener codigo malicioso no declarado.
- La contrasena de descompresion publicada (`2026`) y los enlaces a un repositorio de GitHub de terceros (`hansson31102/...`) no aportan garantia de integridad; no se ofrece hash ni firma del binario.
- Uso contrario a los terminos de servicio del videojuego y posible sancion en entornos multijugador.
- La licencia MIT declarada afecta al contenido del repositorio, no exime de responsabilidad por el uso del ejecutable ni por danos derivados.
- Ausencia total de sesgos linguisticos evaluables por la sencilla razon de que no hay modelo; cualquier analisis de sesgo, alucinacion o contexto es inaplicable.
- No debe ejecutarse en equipos con credenciales, datos personales o acceso a redes corporativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zrbobozrx/kingdom-come-deliverance-2-trainer-v3
- Repositorio de GitHub referenciado en la model card: https://github.com/hansson31102/kingdom-come-deliverance-2-trainer-v3
- Releases del repositorio referenciado: https://github.com/hansson31102/kingdom-come-deliverance-2-trainer-v3/releases/latest
- Paquete directo citado en la model card (no verificado): https://github.com/hansson31102/kingdom-come-deliverance-2-trainer-v3/releases/latest/download/kingdom-come-deliverance-2-trainer-v3-v1.2.0-win64.zip
