# sreeharanhub/aeon-os

## Resumen

Aeon OS 0.11.0 no es un modelo de inteligencia artificial, sino un sistema operativo minimo para plataformas UEFI x86_64 escrito desde cero en Rust. El repositorio de Hugging Face `sreeharanhub/aeon-os` distribuye artefactos de software (una imagen ISO arrancable, el codigo fuente completo, una captura de pantalla y sumas de verificacion), no pesos de red neuronal. Por tanto, esta ficha documenta el artefacto tal y como aparece publicado, senalando de forma explicita los campos que no aplican a un modelo de lenguaje.

El proyecto lo mantiene el usuario `sreeharanhub`, con el codigo fuente alojado en GitHub bajo el repositorio `PlayerSS08/aeon-os`. La version publicada es la 0.11.0, compilada el 25 de noviembre de 2026, y su unico objetivo declarado es arrancar en firmware UEFI sobre arquitectura x86_64 y ofrecer un interprete de comandos basico (`aeon>`) con un comando `help`.

Dado que el artefacto no contiene pesos, tokenizador, configuracion de transformer ni pipeline de inferencia, las secciones habituales de una ficha de modelo (parametros, contexto, cuantizacion, benchmarks, VRAM) se marcan como no disponibles o no aplicables. La relevancia de esta entrada es, por tanto, la de un ejemplo de publicacion de software de sistemas en Hugging Face y no la de un modelo evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (sistema operativo UEFI x86_64, no red neuronal) |
| Parametros totales | No aplicable |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | other (sin terminos concretos especificados en la model card) |
| Formato de pesos | No aplicable; se distribuyen `Aeon-OS-0.11.0-x86_64.iso` (imagen ISO UEFI El Torito) y `aeon-os-source.zip` (codigo fuente) |
| Tamano del repositorio | 0.0 GB segun Hugging Face |
| Plataforma objetivo | UEFI x86_64 |
| Lenguaje de implementacion | Rust (target `x86_64-unknown-uefi`) |
| Pipeline de Hugging Face | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-25 |
| Ultima actualizacion | 2026-11-25 |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red neuronal. El artefacto es un binario EFI (`aeon.efi`) generado con `cargo build --release` para el target `x86_64-unknown-uefi`, empaquetado en una imagen ISO con estructura UEFI El Torito. Dentro de la imagen, `aeon.efi` se coloca en `EFI/BOOT/BOOTX64.EFI` junto con un fichero de configuracion `aeon.cfg`.

El flujo de construccion documentado requiere anadir el target UEFI a la toolchain de Rust (`rustup target add x86_64-unknown-uefi`) y compilar en modo release. No se detallan en la informacion disponible ni el gestor de arranque, ni los drivers, ni el modelo de memoria, ni las dependencias del crate mas alla del propio target de compilacion.

## Capacidades

- Arranque en firmware UEFI sobre x86_64 y presentacion de un interprete de comandos con prompt `aeon>`.
- Comando `help` para listar la ayuda disponible en el shell.
- Distribucion como ISO arrancable verificable mediante `SHA256SUMS.txt`.
- Ejecucion en maquina virtual: la model card documenta el procedimiento para VirtualBox con tipo "Other", version "Other/Unknown (64-bit)", 1 GB de RAM y EFI habilitado.
- Inclusión del codigo fuente completo para auditoria y recompilacion.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue, al no ser un modelo de IA.

## Casos de uso

- Evaluacion de sistemas operativos didacticos: permite arrancar un SO minimo escrito en Rust en una VM con EFI para estudiar como se estructura un binario UEFI y su imagen ISO.
- Docencia de desarrollo de sistemas en Rust: el codigo fuente incluido sirve como material para practicas de compilacion cruzada al target `x86_64-unknown-uefi`.
- Pruebas de cadenas de arranque UEFI: util para verificar configuraciones de firmware EFI en hipervisores como VirtualBox antes de desplegar cargadores propios.
- Verificacion de integridad de artefactos: el fichero `SHA256SUMS.txt` permite comprobar que la ISO y el ZIP de fuente no se han corrompido en la descarga.
- Base para experimentos de shell embebido: el prompt `aeon>` y el comando `help` constituyen un punto de partida minimo sobre el que anadir comandos propios.
- Reproducibilidad de builds: al incluir el codigo fuente y documentar los pasos de compilacion, permite reconstruir la ISO y comparar el resultado con la publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no procede aplicar metricas como MMLU, HumanEval o GSM8K. Tampoco se documentan tiempos de arranque, consumo de memoria en ejecucion ni latencia del shell.

## Requisitos de hardware

- No requiere VRAM ni GPU: es un sistema operativo, no un modelo de inferencia.
- Memoria recomendada por el autor: 1 GB de RAM para la maquina virtual en VirtualBox.
- Firmware: UEFI obligatorio (en VirtualBox, casilla "Enable EFI" en Settings > System).
- Almacenamiento: la ISO se adjunta como unidad optica en la VM; el repositorio de Hugging Face declara 0.0 GB de tamano.
- Plataforma: x86_64 exclusivamente; no se menciona soporte para ARM, RISC-V ni BIOS legacy.
- Despliegue: maquina virtual (VirtualBox documentado) o hardware x86_64 con UEFI; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Nota de compatibilidad: si el EFI de VirtualBox falla antes de cargar Aeon, el autor indica ejecutar `VBoxManage setextradata "<vm-name>" VBoxInternal/CPUM/MtrrVarCountIsVirtual 0`.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables y el artefacto no pertenece a la categoria de modelos de lenguaje. Como referencia de categoria, podria compararse con otros proyectos de SO en Rust (por ejemplo, desarrollos didacticos basados en el ecosistema `uefi-rs`), pero no se dispone de datos verificables en la informacion suministrada para establecer una tabla con parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede usarse para tareas de NLP, codigo o vision.
- La licencia figura como `other` sin que la model card concrete los terminos; no se puede asumir uso comercial libre sin consultar al autor.
- No se declaran idiomas soportados ni documentacion multilingue; el unico contenido descrito esta en ingles.
- Ambito muy reducido: el unico comando documentado es `help`, y no se detallan capacidades adicionales del shell.
- Compatibilidad limitada a UEFI x86_64; no hay soporte declarado para BIOS legacy ni otras arquitecturas.
- Requiere un ajuste especifico de VirtualBox en caso de fallo del firmware EFI, lo que indica posibles problemas de compatibilidad con hipervisores.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni de auditoria externa.
- El repositorio declara 0.0 GB, lo que puede indicar que Hugging Face no ha calculado el tamano real de los artefactos; conviene verificar los checksums antes de usar la ISO.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sreeharanhub/aeon-os
- Codigo fuente en GitHub: https://github.com/PlayerSS08/aeon-os
- Documentacion de Rust para el target UEFI: https://doc.rust-lang.org/rustc/platform-support/unknown-uefi.html (referencia generica del target `x86_64-unknown-uefi`; no enlazada por el autor)
