# YuminKim/omx-setup

## Resumen

YuminKim/omx-setup no es un modelo de inteligencia artificial, sino un repositorio de configuración y parches para un brazo robótico ROBOTIS OMX controlado con LeRobot. Su contenido principal es una model card en coreano que documenta la resolución de un problema de sobrecarga en el gripper seguidor (ID 16), junto con dos artefactos: `omx_patches.diff`, que modifica el código fuente de LeRobot, y `omx_calibration.tar.gz`, que contiene el directorio de calibración completo de `~/.cache/huggingface/lerobot/calibration`.

El repositorio aborda un fallo concreto: el gripper se saturaba y terminaba devolviendo el error 32 (Overload) aproximadamente 2,5 segundos después de iniciar el cierre, a pesar de que la corriente medida (162) estaba muy por debajo del límite configurado (600). La documentación identifica cuatro causas combinadas: ausencia de calibración entre líder y seguidor, ganancias de posición insuficientes, saturación del PWM en el valor máximo de 885 y una obstrucción mecánica por un tornillo suelto.

Es relevante para equipos que despliegan brazos OMX con LeRobot y necesitan reproducir una configuración de gripper estable, pero no contiene pesos, arquitectura de red neuronal, tokenizador ni capacidad de inferencia. Los metadatos de HuggingFace no declaran licencia, idiomas ni pipeline, y el repositorio tiene un tamaño de 0,0 GB con cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un repositorio de configuración para un actuador Dynamixel) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible; la model card está redactada en coreano |
| Licencia | no disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | no aplica; el repositorio contiene `omx_patches.diff` y `omx_calibration.tar.gz` |
| Tipo de artefacto | configuración de hardware y parche de software |
| Hardware objetivo | ROBOTIS OMX con LeRobot; actuador Dynamixel ID 16 (seguidor) e ID 6 (líder) |
| Modo de control | Operating Mode 5 (control de posición basado en corriente) |
| Versión de LeRobot | no disponible |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto describe la configuración de un actuador Dynamixel en modo de control de posición basado en corriente (Operating Mode 5). Los parámetros documentados incluyen `Current_Limit` en 600 (EEPROM, dirección 38), `Goal_Current` en 100 para mantenimiento y 200 para el impulso de movimiento (RAM, dirección 102), `Position_P_Gain` en 800 (RAM, dirección 84), `Position_I_Gain` y `Position_D_Gain` en 0 (RAM, direcciones 82 y 80), y límites de posición mínimo 2123 y máximo 2873 (EEPROM, direcciones 52 y 48). Para el gripper líder (ID 6) se indica un `homing_offset` de 100 y un rango de 917 a 2577.

El diagnóstico técnico recoge cuatro capas de fallo. Primero, la falta de calibración hacía que los valores en crudo del líder se transmitiesen 1:1 al seguidor, con rangos de movimiento distintos; además, modificar solo el JSON provocaba que `calibrate()` restaurase los valores por defecto (0–4095) al detectar `is_calibrated` inconsistente, por lo que fue necesario ajustar conjuntamente la EEPROM del motor y el JSON. Segundo, las ganancias originales P 250 y D 600 no generaban suficiente par ante errores de posición pequeños para vencer la fricción. Tercero, durante el agarre el PWM se saturaba en el límite 885 y el firmware interpretaba la persistencia de salida máxima como sobrecarga, aunque la corriente de 162 quedase lejos del `Current_Limit` de 600. Cuarto, un tornillo suelto bloqueaba físicamente la apertura; tras apretarlo, el extremo de apertura pasó de 2573 a 2902.

La model card advierte de que las ganancias de posición y `Goal_Current` residen en RAM y se pierden al apagar o reiniciar; además, LeRobot los reescribe en `configure()` al conectar, por lo que deben incorporarse al código fuente mediante el parche. `Current_Limit` y los límites de posición residen en EEPROM y requieren `Torque_Enable=0` y `Hardware Error=0` para escribirse. El registro `Hardware Error Status` (dirección 70) solo se borra mediante reinicio o corte de alimentación. También se documenta la opción de línea de comandos `--teleop.gripper_open_pos=95`, necesaria porque sin ella la salida normalizada del líder se bloquea en 62 y el seguidor no abre lo suficiente.

## Capacidades

- Aplicar un parche al código fuente de LeRobot mediante `git apply` para persistir los parámetros del gripper entre reinicios.
- Restaurar una calibración completa desde `omx_calibration.tar.gz` en `~/.cache/huggingface/lerobot/calibration`.
- Resolver el error 32 (Overload) del gripper seguidor en configuraciones OMX + LeRobot.
- Ajustar límites de corriente, ganancias PID y límites de posición de un actuador Dynamixel.
- Documentar la diferencia entre parámetros persistidos en EEPROM y parámetros volátiles en RAM.
- Servir como referencia de teleoperación líder-esclavo para el eje de gripper.
- No ofrece generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, capacidades multilingües ni modo de pensamiento.

## Casos de uso

- Puesta en marcha de un brazo OMX con LeRobot: aplicar `omx_patches.diff` y restaurar la calibración para evitar que el gripper entre en sobrecarga durante las primeras maniobras de agarre.
- Teleoperación líder-esclavo: usar la opción `--teleop.gripper_open_pos=95` y los límites de posición documentados para que el seguidor reproduzca fielmente la apertura del líder sin bloquearse en el valor normalizado 62.
- Mantenimiento correctivo de una flota de brazos OMX: comparar los registros de EEPROM y RAM de cada unidad con los valores de referencia para detectar desviaciones de calibración o ganancias mal configuradas.
- Integración en un pipeline de configuración robótica: versionar el parche y el archivo de calibración junto al resto de la infraestructura, de modo que cada estación de trabajo reciba una configuración reproducible.
- Diagnóstico de saturación de PWM: utilizar la distinción entre límite de corriente y criterio de sobrecarga para descartar falsos positivos y localizar obstrucciones mecánicas, como el tornillo suelto descrito.
- Docencia en robótica de manipulación: emplear el caso como ejemplo práctico de interacción entre calibración, control en lazo cerrado, límites de EEPROM y comportamiento del firmware Dynamixel.
- Replicación de una estación de investigación: restaurar el entorno calibrado en un segundo equipo para que los experimentos de agarre partan de las mismas condiciones de hardware.
- Ajuste de parámetros de agarre: modificar `Goal_Current` y las ganancias P/I/D para adaptar la fuerza de cierre a objetos frágiles, verificando previamente que el hardware soporta los valores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión, latencia, throughput ni evaluaciones comparativas; únicamente documenta un diagnóstico cualitativo y valores de registros de un actuador concreto.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no se ejecuta ningún modelo de IA.
- GPU recomendadas: no aplica; no se requiere GPU.
- Compatibilidad con GPU de consumo: no aplica.
- Hardware robótico necesario: brazo ROBOTIS OMX, actuadores Dynamixel con IDs 6 y 16, interfaz de comunicación compatible con LeRobot (por ejemplo, U2D2 o placa controladora equivalente) y alimentación adecuada.
- Equipo anfitrión: ordenador con Python, LeRobot instalado, `git` para aplicar el parche y acceso al directorio de calibración de HuggingFace.
- Almacenamiento: el repositorio ocupa 0,0 GB; el archivo de calibración y el parche son de tamaño reducido.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI; el despliegue consiste en aplicar el diff y copiar la calibración.
- Latencia y throughput: no disponibles; dependen del bus Dynamixel, de la frecuencia de control de LeRobot y de la configuración mecánica.

## Comparativa con modelos similares

No se han identificado alternativas públicas equivalentes en la información disponible. Este repositorio no es comparable con modelos de lenguaje o de visión, ya que no contiene pesos ni arquitectura de inferencia. La comparación se limita a otras configuraciones de gripper para OMX/LeRobot, para las que no hay datos publicados en la información proporcionada.

| Criterio | YuminKim/omx-setup | Otras configuraciones de gripper OMX/LeRobot |
|---|---|---|
| Parámetros | no aplica | no disponible |
| Longitud de contexto | no disponible | no disponible |
| Rendimiento | no disponible | no disponible |
| Licencia | no disponible | no disponible |
| Disponibilidad | pública en HuggingFace, 0 descargas y 0 likes en la consulta | no disponible |

## Limitaciones y advertencias

- No es un modelo de IA: no puede emplearse para inferencia, generación de texto, código, visión ni ninguna tarea cognitiva.
- La licencia no está declarada; no se puede asumir permiso para uso comercial ni para redistribución.
- La documentación está en coreano y no se ofrece traducción oficial, lo que puede dificultar su adopción por equipos hispanohablantes.
- Los valores de registros son específicos de una unidad y una calibración concretas; aplicarlos a otro hardware puede provocar daños mecánicos o un comportamiento incorrecto.
- Los parámetros en RAM se pierden al reiniciar y LeRobot los reescribe en `configure()`; el parche debe mantenerse actualizado si cambia la versión de LeRobot.
- La escritura en EEPROM exige `Torque_Enable=0` y `Hardware Error=0`; el registro de error de hardware solo se borra con reinicio o corte de alimentación.
- El parche `omx_patches.diff` puede no aplicar limpiamente sobre versiones distintas del código fuente de LeRobot.
- El archivo `omx_calibration.tar.gz` contiene datos locales de calibración; conviene revisar su contenido y no reutilizarlo ciegamente en otra estación.
- El repositorio no incluye tests, validaciones automatizadas ni benchmarks que permitan verificar la reproducibilidad de la configuración.
- Los metadatos presentan una fecha de creación de 2026-10-29, posterior a la fecha habitual de consulta, lo que conviene verificar antes de citar el recurso.
- No hay garantía de soporte por parte del autor; el repositorio registra cero descargas y cero likes.

## Enlaces

- HuggingFace: https://huggingface.co/YuminKim/omx-setup
- OMX Docs, skill omx-setup: https://omx.vibetip.help/docs/skills/utility/omx-setup (no relacionado con el repositorio; hace referencia a una skill de prompts y configuración de OMX)
- GitHub, YvanKOB/oumi---oumi-ai: https://github.com/YvanKOB/oumi---oumi-ai (no relacionado; plataforma Oumi para ciclo de vida de modelos fundacionales)
- GitHub, Yeachan-Heo/oh-my-codex: https://github.com/Yeachan-Heo/oh-my-codex (no relacionado; herramientas de prompts y workflows para Codex)
- Tutoriales de Oumi OSS: https://oumi.ai/docs/en/latest/get_started/tutorials.html (no relacionado)
- Model System de Oumi en DeepWiki: https://deepwiki.com/oumi-ai/oumi/4.2-model-system (no relacionado)
