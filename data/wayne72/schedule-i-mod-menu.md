# wayne72/schedule-i-mod-menu

## Resumen

No se dispone de informacion que permita describir `wayne72/schedule-i-mod-menu` como un modelo de IA. El identificador corresponde a un repositorio alojado en Hugging Face cuyo contenido, segun los metadatos y la model card proporcionados, no es un modelo de lenguaje ni de aprendizaje automatico, sino un paquete ejecutable para Windows presentado como "menu de mods" del videojuego Schedule I. El repositorio esta etiquetado con `windows`, `windows-11`, `x64`, `portable` y `schedule-i-mod-menu`, y su card describe la descarga de un archivo ZIP de 4,8 MB protegido con contrasena, junto con un ejecutable `.exe` que se solicita ejecutar como administrador.

El contenido de la model card incluye referencias cruzadas a otros repositorios y nombres de archivo ajenos al identificador del repositorio (por ejemplo, `blox-fruits-script-keyless-2026-v1.2.2-win64.exe`), lo que resulta incoherente con el nombre del paquete. Esta discrepancia, junto con la peticion de ejecutar un binario sin firma como administrador y la ausencia total de documentacion tecnica sobre arquitectura, pesos o entrenamiento, impide tratarlo como un artefacto de IA evaluable.

Por tanto, esta ficha documenta la ausencia de especificaciones de modelo y advierte de los riesgos de seguridad asociados. No se han encontrado parametros, contexto, licencia de modelo, formato de pesos ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; paquete ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT (segun metadatos del repositorio) |
| Formato de pesos | no disponible (el repositorio distribuye un archivo `.zip` y un `.exe`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura, datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF, DPO). El repositorio no contiene pesos de modelo ni documentacion de entrenamiento; la model card describe un paquete comprimido de 4,8 MB con un ejecutable para Windows 10 y Windows 11, lo que es incompatible con el tamano y la naturaleza de un modelo de lenguaje.

La unica informacion tecnica presente en la card hace referencia a modulos de un supuesto menu de mods (overlay externo, filtrado de loot, perfiles JSON), sin ninguna relacion con modelos de IA. No es posible verificar la procedencia del binario ni su cadena de compilacion.

## Capacidades

- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue en el sentido de procesamiento de lenguaje natural; los idiomas listados son etiquetas de metadatos del repositorio.
- No se documenta ningun modo especial (thinking mode, audio, etc.).

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no se han documentado casos de uso legitimos de procesamiento de lenguaje.
- No se recomienda su ejecucion en entornos de desarrollo, investigacion ni produccion, dado que se trata de un binario sin firma que solicita privilegios de administrador.
- No se recomienda su uso como dependencia en pipelines de CI/CD ni en entornos con datos sensibles.
- No se recomienda su instalacion en maquinas de trabajo o servidores, por el riesgo de ejecucion de codigo no verificado.
- No existe documentacion que permita evaluar su idoneidad para ninguna tarea concreta.
- Cualquier evaluacion practica requeriria analisis estatico y dinamico del binario en un entorno aislado, lo que queda fuera del alcance de esta ficha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no es un modelo de IA).
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no disponibles.
- Requisitos declarados por el autor: Windows 10 o Windows 11 de 64 bits y un archivo ZIP de 4,8 MB; no se especifican requisitos de CPU, RAM o GPU.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable, ya que el artefacto no es un modelo de IA.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal es un error de clasificacion.
- La model card incluye enlaces y nombres de archivo que no coinciden con el identificador del repositorio, lo que sugiere contenido copiado o reutilizado de otro proyecto.
- Se solicita ejecutar un binario `.exe` como administrador tras extraerlo de un ZIP protegido con contrasena; esta practica dificulta el analisis por parte de antivirus y motores de escaneo.
- No hay firma digital, hash publicado ni procedencia verificable del ejecutable.
- Riesgo elevado de malware, adware o robo de credenciales; no debe ejecutarse en sistemas con datos sensibles.
- La licencia MIT declarada en los metadatos no garantiza la legalidad ni la seguridad del contenido distribuido.
- No se han identificado sesgos de modelo ni riesgos de alucinacion porque no hay modelo; el riesgo relevante es de seguridad informatica.
- No apto para uso comercial ni para produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wayne72/schedule-i-mod-menu
- Referencia citada en la model card (no verificada): https://github.com/JisungDiaz447/blox-fruits-script-keyless-2026/releases/download/v1.2.0/blox-fruits-script-keyless-2026-v1.2.2-win64.zip
- Referencia citada en la model card (no verificada): https://github.com/dmitryo029/schedule-i-mod-menu/releases/latest
